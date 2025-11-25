import chalk from "chalk"
import path from "path"

import { deployWithRetry } from "#api/retry.ts"
import { fetchSourceFileIfExists } from "#api/source/fetchSourceFile.ts"
import { getCachedConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { promptForConfirmation, promptForInput } from "#console/userPrompt.ts"
import { calculateTreeHash } from "#filesystem/calculateTreeHash.ts"
import { readFileIfExists, writeFile } from "#filesystem/filesystem.ts"

type PushDeploymentOptions = {
  description?: string
  force: boolean
}

const formatHash = (hash: string | null) => chalk.cyan(hash?.slice(0, 8) || "none")

const confirmOrCancel = async (message: string, defaultAnswer: "N" | "Y" = "N") => {
  const confirmed = await promptForConfirmation(message, defaultAnswer)
  if (!confirmed) {
    Logger.info("Deployment cancelled by user.")
  }
  return confirmed
}

export async function deploymentsPush({ description, force }: PushDeploymentOptions) {
  const { projectPath } = getCachedConfig()
  const targetFolder = path.resolve(projectPath)

  const localHash = calculateTreeHash()
  const remoteHash = await fetchSourceFileIfExists("build/hash")
  const lastSeenRemoteHash = readFileIfExists(path.join(targetFolder, ".nostocache/hash"))

  if (!remoteHash) {
    Logger.error("No files found in remote. Please run 'st push' first to push your files.")
    return
  }

  if (!force) {
    if (localHash !== remoteHash) {
      Logger.warn(`Local files (hash: ${formatHash(localHash)}) don't match remote (hash: ${formatHash(remoteHash)}).`)
      Logger.warn(`You may need to run ${chalk.cyan("st push")} first to push your changes.`)
      if (!(await confirmOrCancel("Continue with deployment anyway?"))) {
        return
      }
    }

    if (lastSeenRemoteHash !== remoteHash) {
      Logger.warn(`Remote files have changed since your last sync (last seen: ${formatHash(lastSeenRemoteHash)}).`)
      if (!(await confirmOrCancel("Continue with deployment?"))) {
        return
      }
    }
  }

  const deploymentDescription = description || (await promptForInput("Enter a description for this deployment:"))

  if (!deploymentDescription) {
    Logger.error("Description is required for deployment.")
    return
  }

  if (!force) {
    const confirmationMessage = `You are about to create a deployment with description: ${chalk.cyan(`"${deploymentDescription}"`)}. Continue?`
    if (!(await confirmOrCancel(confirmationMessage))) {
      return
    }
  }

  Logger.info("Creating deployment from remote 'build' path...")
  Logger.info(`Description: ${chalk.cyan(`"${deploymentDescription}"`)}`)

  await deployWithRetry("build", deploymentDescription)

  Logger.success("Deployment created successfully!")

  writeFile(path.join(targetFolder, ".nostocache/hash"), remoteHash)
}
