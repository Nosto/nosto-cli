import chalk from "chalk"
import fs from "fs"
import path from "path"

import { fetchWithRetry } from "#api/retry.ts"
import { fetchSourceFile, fetchSourceFileIfExists } from "#api/source/fetchSourceFile.ts"
import { listSourceFiles } from "#api/source/listSourceFiles.ts"
import { getCachedConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { promptForConfirmation } from "#console/userPrompt.ts"
import { calculateTreeHash } from "#filesystem/calculateTreeHash.ts"
import { writeFile } from "#filesystem/filesystem.ts"
import { processInBatches } from "#filesystem/processInBatches.ts"

type PullSearchTemplateOptions = {
  // Filter to only pull these files. Ignored if empty.
  paths: string[]
  // Skip checking the hash and pull all files.
  force: boolean
}

/**
 * Fetches the current templates to the specified target path.
 * Processes files in parallel with controlled concurrency and retry logic.
 */
export async function pullSearchTemplate({ paths, force }: PullSearchTemplateOptions) {
  const { projectPath, dryRun } = getCachedConfig()
  const targetFolder = path.resolve(projectPath)

  // If the local and remote hashes match, assume the content matches as well
  const localHash = calculateTreeHash()
  const remoteHash = await fetchSourceFileIfExists("build/hash")
  if (localHash === remoteHash && !force) {
    Logger.success("Local template is already up to date.")
    writeFile(path.join(targetFolder, ".nostocache/hash"), localHash)
    return
  }

  Logger.info(`Fetching templates to: ${chalk.cyan(targetFolder)}`)

  // Fetch the remote file list (filtered by paths if provided)
  const baseFiles = await listSourceFiles()
  const files = baseFiles.filter(file => paths.length === 0 || paths.includes(file.path))
  Logger.info(`Found ${chalk.cyan(files.length)} source files to fetch.`)

  // Check for existing files that will be overridden
  const filesToOverride = files.filter(file => {
    const targetFilePath = path.join(targetFolder, file.path)
    return fs.existsSync(targetFilePath)
  })

  // Just for safety, show a warning if the user is about to override files.
  if (filesToOverride.length > 0 && !force) {
    Logger.warn(`${chalk.cyan(filesToOverride.length)} files will be overridden:`)

    // Show first 10 files that will be overridden
    const previewFiles = filesToOverride.slice(0, 10)
    previewFiles.forEach(file => {
      Logger.warn(`${chalk.yellow("•")} ${chalk.cyan(file.path)}`)
    })
    if (filesToOverride.length > 10) {
      Logger.warn(`${chalk.yellow("...")} and ${chalk.cyan(filesToOverride.length - 10)} more`)
    }

    // Ask for confirmation
    const confirmed = await promptForConfirmation(`Are you sure you want to override your local data?`, "N")
    if (!confirmed) {
      Logger.info("Operation cancelled by user")
      return
    }
  }

  // Pull the files into batches to avoid overwhelming the API (relevant mostly for local dev)
  await processInBatches({
    files: files.map(file => file.path),
    logIcon: chalk.blue("↓"),
    processElement: async filePath => {
      const data = await fetchWithRetry(fetchSourceFile, filePath)
      const pathToWrite = path.join(targetFolder, filePath)
      writeFile(pathToWrite, data)
    }
  })

  // Write the hash
  if (!dryRun && fs.existsSync(path.join(targetFolder, "build/hash"))) {
    fs.copyFileSync(path.join(targetFolder, "build/hash"), path.join(targetFolder, ".nostocache/hash"))
  }
}
