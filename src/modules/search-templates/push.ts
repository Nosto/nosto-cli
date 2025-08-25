import chalk from "chalk"
import fs from "fs"
import path from "path"

import { fetchSourceFileIfExists } from "#api/source/fetchSourceFile.ts"
import { putSourceFile } from "#api/source/putSourceFile.ts"
import { getCachedConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { promptForConfirmation } from "#console/userPrompt.ts"
import { calculateTreeHash } from "#filesystem/calculateTreeHash.ts"
import { listAllFiles, readFileIfExists, writeFile } from "#filesystem/filesystem.ts"
import { processInBatches } from "#filesystem/processInBatches.ts"

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

type PushSearchTemplateOptions = {
  // Filter to only push these files. Ignored if empty.
  paths: string[]
  // Skip checking the hash and push all files.
  force: boolean
}

/**
 * Deploys templates to the specified target path.
 * Processes files in parallel with controlled concurrency and retry logic.
 */
export async function pushSearchTemplate({ paths, force }: PushSearchTemplateOptions) {
  const { projectPath } = getCachedConfig()
  const targetFolder = path.resolve(projectPath)

  // List all files, excluding ignored and filtered by paths
  const { allFiles, unfilteredFileCount } = listAllFiles(targetFolder)
  const files = allFiles.filter(file => paths.length === 0 || paths.includes(file))

  // Found literally no files -> nothing to do.
  if (files.length === 0) {
    Logger.warn("No files to push. Exiting.")
    return
  }

  // If the local and remote hashes match, assume the content matches as well
  const localHash = calculateTreeHash()
  const remoteHash = await fetchSourceFileIfExists("build/hash")
  if (localHash === remoteHash && !force) {
    Logger.success("Remote template is already up to date.")
    writeFile(path.join(targetFolder, ".nostocache/hash"), localHash)
    return
  }

  /**
   * If remote hash is present, we can check if there are conflicts. If not, just show the warning anyway.
   * If remote hash doesn't match local hash, but remote hash matches last seen remote hash, then this is a clean push that shouldn't override anything.
   * If .nostocache/hash is not present, it's a fresh checkout, but local state has changed already. Show the warning just in case.
   * If remote hash doesn't match last seen remote hash, another user has pushed. Assume conflicts and show the warning.
   */
  const lastSeenRemoteHash = readFileIfExists(path.join(targetFolder, ".nostocache/hash"))
  const shouldPrompt = !remoteHash || !lastSeenRemoteHash || remoteHash !== lastSeenRemoteHash
  if (!force && shouldPrompt) {
    let confirmationMessage = `It seems that the template has been changed since your last push. Are you sure you want to continue?`
    if (!remoteHash || !lastSeenRemoteHash) {
      confirmationMessage = `It seems that this is the first time you are pushing to this environment. Please make sure your local copy is up to date. Continue?`
    }
    const confirmed = await promptForConfirmation(confirmationMessage, "N")
    if (!confirmed && !force) {
      Logger.info("Push operation cancelled by user.")
      return
    }
  }

  Logger.info(`Pushing template from: ${chalk.cyan(targetFolder)}`)

  // Update the hash files
  writeFile(path.join(targetFolder, "build/hash"), localHash)
  writeFile(path.join(targetFolder, ".nostocache/hash"), localHash)

  // The hash file didn't exist, but now it does
  if (!files.includes("build/hash")) {
    files.push("build/hash")
  }

  // Collect some stats
  const buildFileCount = files.filter(file => file.includes("build/")).length
  const sourceFileCount = files.length - buildFileCount

  const sourceFilesLabel = `${chalk.cyan(sourceFileCount)} source`
  const builtFilesLabel = `${chalk.cyan(buildFileCount)} built`
  const ignoredFilesLabel = `${chalk.cyan(unfilteredFileCount - files.length)} ignored`
  Logger.info(
    `Found ${chalk.cyan(files.length)} files to push (${sourceFilesLabel}, ${builtFilesLabel}, ${ignoredFilesLabel}).`
  )

  // Push the files in batches to avoid overwhelming the API (relevant mostly for local dev)
  await processInBatches({
    files,
    logIcon: chalk.magenta("↑"),
    processElement: async file => {
      const filePath = path.join(targetFolder, file)
      await putWithRetry(file, fs.readFileSync(filePath, "utf-8"))
    }
  })
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
