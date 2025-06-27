import fs from "fs"
import path from "path"
import { putSourceFile } from "../../api/putSourceFile.ts"
import { Logger } from "../../console/logger.ts"
import chalk from "chalk"
import { getCachedConfig } from "../../config/config.ts"
import { promptForConfirmation } from "../../console/userPrompt.ts"

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

let filesPushed = 0
let totalFilesToPush = 0

type PushSearchTemplateOptions = {
  paths: string[]
  skipConfirmation: boolean
}

/**
 * Deploys templates to the specified target path.
 * Processes files in parallel with controlled concurrency and retry logic.
 */
export async function pushSearchTemplate(options: PushSearchTemplateOptions) {
  const { projectPath } = getCachedConfig()
  const { paths, skipConfirmation } = options
  const targetFolder = path.resolve(projectPath)
  Logger.info(`Deploying templates from: ${chalk.cyan(targetFolder)}`)
  if (!fs.existsSync(targetFolder)) {
    throw new Error(`Target folder does not exist: ${chalk.cyan(targetFolder)}`)
  }
  if (!fs.statSync(targetFolder).isDirectory()) {
    throw new Error(`Target path is not a directory: ${chalk.cyan(targetFolder)}`)
  }

  Logger.debug("Sanity checking the target directory...")
  // Read the index.js file in the current directory and ensure it has a mention of @nosto/preact
  const indexFilePath = path.join(targetFolder, "index.js")
  if (!fs.existsSync(indexFilePath)) {
    throw new Error(`Index file does not exist: ${indexFilePath}`)
  }
  const indexFileContent = fs.readFileSync(indexFilePath, "utf-8")
  if (!indexFileContent.includes("@nosto/preact")) {
    throw new Error(`Index file does not contain @nosto/preact: ${indexFilePath}`)
  }

  // Recursively list all files in the directory (excluding files in gitignore)
  const files = fs
    .readdirSync(targetFolder, { withFileTypes: true, recursive: true })
    .filter(dirent => dirent.isFile() && !dirent.name.startsWith("."))
    .filter(dirent => !dirent.name.includes("node_modules"))
    .map(dirent => dirent.parentPath + "/" + dirent.name)
    // To relative path
    .map(file => file.replace(targetFolder + "/", ""))
    .filter(file => paths.length === 0 || paths.includes(file))

  const buildFileCount = files.filter(file => file.includes("build/")).length
  const sourceFileCount = files.length - buildFileCount

  Logger.info(
    `Found ${chalk.cyan(files.length)} files to push (${chalk.cyan(sourceFileCount)} source, ${chalk.cyan(buildFileCount)} built).`
  )
  if (files.length === 0) {
    Logger.warn("No files to push. Exiting.")
    return
  }

  if (!skipConfirmation) {
    const config = getCachedConfig()
    const confirmationMessage = `Are you sure you want to push ${chalk.cyan(files.length)} files to merchant ${chalk.greenBright(config.merchant)}'s ${chalk.redBright(config.templatesEnv)} environment at ${chalk.blueBright(config.apiUrl)}?`
    const confirmed = await promptForConfirmation(confirmationMessage, "N")
    if (!confirmed) {
      Logger.info("Push operation cancelled by user.")
      return
    }
  }

  const batchSize = getCachedConfig().maxRequests
  const batches = []
  filesPushed = 0
  totalFilesToPush = files.length
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize))
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    await processBatch(batch, targetFolder)
  }
}

async function processBatch(files: string[], targetFolder: string): Promise<void> {
  const batchPromises = files.map(async file => {
    const filePath = path.join(targetFolder, file)
    try {
      await putWithRetry(file, fs.readFileSync(filePath, "utf-8"))
      filesPushed += 1
      Logger.info(`${chalk.green("✓")} [${filesPushed}/${totalFilesToPush}] ${chalk.magenta("↑")} ${chalk.cyan(file)}`)
      return { success: true, filePath: file }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      Logger.error(`${chalk.red("✗")} ${chalk.cyan(file)}: ${errorMessage}`)
      return { success: false, filePath: file, error: errorMessage }
    }
  })

  const results = await Promise.allSettled(batchPromises)
  const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected")

  if (failures.length > 0) {
    Logger.warn(`Batch completed with ${failures.length} failures`)
  }
}

async function putWithRetry(filePath: string, content: string, retryCount = 0): Promise<void> {
  try {
    return await putSourceFile(filePath, content)
  } catch (error: unknown) {
    if (retryCount >= MAX_RETRIES) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to push ${filePath} after ${MAX_RETRIES} retries: ${errorMessage}`)
    }
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount)
    Logger.warn(
      `${chalk.yellow("⟳")} Failed to push ${chalk.cyan(filePath)}: Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
    )
    await new Promise(resolve => setTimeout(resolve, delay))
    return putWithRetry(filePath, content, retryCount + 1)
  }
}
