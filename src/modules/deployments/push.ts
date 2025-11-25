import chalk from "chalk"
import path from "path"

import { deployWithRetry } from "#api/retry.ts"
import { fetchSourceFileIfExists } from "#api/source/fetchSourceFile.ts"
import { getCachedConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { promptForConfirmation, promptForInput } from "#console/userPrompt.ts"
import { calculateTreeHash } from "#filesystem/calculateTreeHash.ts"
import { readFileIfExists } from "#filesystem/filesystem.ts"

type PushDeploymentOptions = {
  // Description for the deployment
  description?: string
  // Skip confirmation prompt and hash check
  force: boolean
}

export async function deploymentsPush({ description, force }: PushDeploymentOptions) {
  const { projectPath } = getCachedConfig()
  const targetFolder = path.resolve(projectPath)

  const localHash = calculateTreeHash()
  const remoteHash = await fetchSourceFileIfExists("build/hash")
  const lastSeenRemoteHash = readFileIfExists(path.join(targetFolder, ".nostocache/hash"))

  if (localHash !== remoteHash && !force) {
    Logger.warn(
      `${chalk.yellow("⚠")} Local files (hash: ${chalk.cyan(localHash?.slice(0, 8))}) don't match remote (hash: ${chalk.cyan(remoteHash?.slice(0, 8) || "none")}).`
    )
    Logger.warn(`You may need to run ${chalk.cyan("st push")} first to push your changes.`)
    const confirmed = await promptForConfirmation("Continue with deployment anyway?", "N")
    if (!confirmed) {
      Logger.info("Deployment cancelled by user.")
      return
    }
  }

  if (lastSeenRemoteHash !== remoteHash && !force) {
    Logger.warn(
      `${chalk.yellow("⚠")} Remote files have changed since your last sync (last seen: ${chalk.cyan(lastSeenRemoteHash?.slice(0, 8) || "none")}).`
    )
    const confirmed = await promptForConfirmation("Continue with deployment?", "N")
    if (!confirmed) {
      Logger.info("Deployment cancelled by user.")
      return
    }
  }

  if (!remoteHash) {
    Logger.error("No files found in remote. Please run 'st push' first to push your files.")
    return
  }

  // Prompt for description if not provided (required field)
  let deploymentDescription = description
  if (!deploymentDescription) {
    deploymentDescription = await promptForInput("Enter a description for this deployment:")
    if (!deploymentDescription) {
      Logger.error("Description is required for deployment.")
      return
    }
  }

  // Confirm deployment
  if (!force) {
    const confirmationMessage = `You are about to create a deployment with description: ${chalk.cyan(`"${deploymentDescription}"`)}. Continue?`
    const confirmed = await promptForConfirmation(confirmationMessage, "N")
    if (!confirmed) {
      Logger.info("Deployment cancelled by user.")
      return
    }
  }

  Logger.info("Creating deployment from remote 'build' path...")
  Logger.info(`Description: ${chalk.cyan(`"${deploymentDescription}"`)}`)

  await deployWithRetry("build", deploymentDescription)

  Logger.success("Deployment created successfully!")

  if (remoteHash) {
    const fs = await import("fs")
    const nostocachePath = path.join(targetFolder, ".nostocache")
    if (!fs.existsSync(nostocachePath)) {
      fs.mkdirSync(nostocachePath, { recursive: true })
    }
    fs.writeFileSync(path.join(nostocachePath, "hash"), remoteHash)
  }
}
