import fs from "fs"
import path from "path"
import { listSourceFiles } from "../../api/listSourceFiles.ts"
import { fetchSourceFile } from "../../api/fetchSourceFile.ts"
import { Logger } from "../../logger/logger.ts"
import chalk from "chalk"
import { getCachedConfig } from "../../config/config.ts"

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

let filesFetched = 0
let totalFilesToFetch = 0

/**
 * Fetches the current templates to the specified target path.
 * Processes files in parallel with controlled concurrency and retry logic.
 */
export async function pullSearchTemplate(targetPath: string, limitToPaths: string[]) {
  const targetFolder = path.resolve(targetPath)
  Logger.info(`Fetching templates to: ${chalk.cyan(targetFolder)}`)
  if (!fs.existsSync(targetFolder)) {
    throw new Error(`Target folder does not exist: ${chalk.cyan(targetFolder)}`)
  }
  if (!fs.statSync(targetFolder).isDirectory()) {
    throw new Error(`Target path is not a directory: ${chalk.cyan(targetFolder)}`)
  }

  const baseFiles = await listSourceFiles()
  const files = baseFiles.filter(file => limitToPaths.length === 0 || limitToPaths.includes(file.path))
  Logger.info(`Found ${chalk.cyan(files.length)} source files to fetch.`)

  const batchSize = getCachedConfig().maxRequests
  const batches = []
  filesFetched = 0
  totalFilesToFetch = files.length
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize))
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    await processBatch(batch, targetFolder)
  }
}

async function processBatch(files: { path: string }[], targetFolder: string): Promise<void> {
  const batchPromises = files.map(async file => {
    const filePath = file.path

    try {
      const data = await fetchWithRetry(filePath)
      filesFetched += 1
      Logger.info(
        `${chalk.green("✓")} [${filesFetched}/${totalFilesToFetch}] ${chalk.blue("↓")} ${chalk.cyan(filePath)}`
      )
      const pathToWrite = path.join(targetFolder, filePath)

      Logger.debug(`Creating directory: ${path.dirname(pathToWrite)}`)
      fs.mkdirSync(path.dirname(pathToWrite), { recursive: true })

      Logger.debug(`Writing to file: ${pathToWrite}`)
      fs.writeFileSync(pathToWrite, data)
      return { success: true, filePath }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      Logger.error(`${chalk.red("✗")} ${chalk.cyan(filePath)}: ${errorMessage}`)
      return { success: false, filePath, error: errorMessage }
    }
  })

  const results = await Promise.allSettled(batchPromises)
  const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected")

  if (failures.length > 0) {
    Logger.warn(`Batch completed with ${failures.length} failures`)
  }
}

async function fetchWithRetry(filePath: string, retryCount = 0): Promise<string> {
  try {
    return await fetchSourceFile(filePath)
  } catch (error: unknown) {
    if (retryCount >= MAX_RETRIES) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to fetch ${filePath} after ${MAX_RETRIES} retries: ${errorMessage}`)
    }
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount)
    Logger.warn(
      `${chalk.yellow("⟳")} Failed to fetch ${chalk.cyan(filePath)}: Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
    )
    await new Promise(resolve => setTimeout(resolve, delay))
    return fetchWithRetry(filePath, retryCount + 1)
  }
}
