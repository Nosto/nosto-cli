import fs from "fs"
import path from "path"
import { listSourceFiles } from "@api/source/listSourceFiles.ts"
import { fetchSourceFile } from "@api/source/fetchSourceFile.ts"
import { Logger } from "@console/logger.ts"
import chalk from "chalk"
import { getCachedConfig } from "@config/config.ts"
import { promptForConfirmation } from "@console/userPrompt.ts"
import { writeFile } from "@filesystem/filesystem.ts"
import { fetchWithRetry } from "@api/retry.ts"

let filesFetched = 0
let totalFilesToFetch = 0

type PullSearchTemplateOptions = {
  paths: string[]
  skipConfirmation: boolean
}

/**
 * Fetches the current templates to the specified target path.
 * Processes files in parallel with controlled concurrency and retry logic.
 */
export async function pullSearchTemplate(options: PullSearchTemplateOptions) {
  const { projectPath } = getCachedConfig()
  const targetFolder = path.resolve(projectPath)
  Logger.info(`Fetching templates to: ${chalk.cyan(targetFolder)}`)
  if (!fs.existsSync(targetFolder)) {
    throw new Error(`Target folder does not exist: ${chalk.cyan(targetFolder)}`)
  }
  if (!fs.statSync(targetFolder).isDirectory()) {
    throw new Error(`Target path is not a directory: ${chalk.cyan(targetFolder)}`)
  }

  const { paths, skipConfirmation } = options
  const baseFiles = await listSourceFiles()
  const files = baseFiles.filter(file => paths.length === 0 || paths.includes(file.path))
  Logger.info(`Found ${chalk.cyan(files.length)} source files to fetch.`)

  // Check for existing files that will be overridden
  const filesToOverride = files.filter(file => {
    const targetFilePath = path.join(targetFolder, file.path)
    return fs.existsSync(targetFilePath)
  })

  if (filesToOverride.length > 0 && !skipConfirmation) {
    Logger.warn(`${chalk.cyan(filesToOverride.length)} files will be overridden:`)

    // Show first 10 files that will be overridden
    const previewFiles = filesToOverride.slice(0, 10)
    previewFiles.forEach(file => {
      Logger.warn(`${chalk.yellow("•")} ${chalk.cyan(file.path)}`)
    })

    if (filesToOverride.length > 10) {
      Logger.warn(`${chalk.yellow("...")} and ${chalk.cyan(filesToOverride.length - 10)} more`)
    }

    const confirmed = await promptForConfirmation(`Are you sure you want to override your local data?`, "N")
    if (!confirmed) {
      Logger.info("Operation cancelled by user")
      return
    }
  }

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

    const data = await fetchWithRetry(fetchSourceFile, filePath)
    filesFetched += 1
    Logger.info(`${chalk.green("✓")} [${filesFetched}/${totalFilesToFetch}] ${chalk.blue("↓")} ${chalk.cyan(filePath)}`)
    const pathToWrite = path.join(targetFolder, filePath)

    writeFile(pathToWrite, data)
  })

  const results = await Promise.allSettled(batchPromises)
  const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected")

  if (failures.length > 0) {
    Logger.warn(`Batch completed with ${failures.length} failures`)
  }
}
