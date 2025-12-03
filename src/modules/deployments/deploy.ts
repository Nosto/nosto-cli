import chalk from "chalk"
import ora from "ora"
import path from "path"

import { deployWithRetry } from "#api/retry.ts"
import { fetchSourceFileIfExists } from "#api/source/fetchSourceFile.ts"
import { getCachedConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { promptForConfirmation, promptForInput } from "#console/userPrompt.ts"
import { calculateTreeHash } from "#filesystem/calculateTreeHash.ts"
import { readFileIfExists, writeFile } from "#filesystem/filesystem.ts"
import { isValidAlphaNumeric } from "#utils/validations.ts"

type DeployOptions = {
  description?: string
  force: boolean
  silent: boolean
}

export async function deploymentsDeploy({ description, force, silent }: DeployOptions) {
  const { projectPath } = getCachedConfig()

  const localHash = calculateTreeHash()
  const remoteHash = await fetchSourceFileIfExists("build/hash")
  const lastSeenRemoteHash = readFileIfExists(path.join(projectPath, ".nostocache/hash"))

  if (!remoteHash) {
    Logger.error("No files found in remote. Please run 'st build --push' first to push your build.")
    return
  }

  if (!force) {
    if (localHash !== remoteHash) {
      Logger.warn("Local files don't match remote.")
      Logger.warn(`You may need to run ${chalk.cyan("st push")} first to push your changes.`)
      const confirmed = await promptForConfirmation("Continue with deployment anyway?", "N")
      if (!confirmed) {
        Logger.info("Deployment cancelled by user.")
        return
      }
    }

    if (lastSeenRemoteHash !== remoteHash) {
      Logger.warn("Remote files have changed since your last sync.")
      const confirmed = await promptForConfirmation("Continue with deployment?", "N")
      if (!confirmed) {
        Logger.info("Deployment cancelled by user.")
        return
      }
    }
  }

  const deploymentDescription = description || (await promptForInput("Enter a description for this deployment:"))

  if (!isValidAlphaNumeric(deploymentDescription)) {
    Logger.error("Description must be alphanumeric and between 1 and 200 characters.")
    return
  }

  if (!force) {
    const confirmed = await promptForConfirmation(
      `You are about to create a deployment with description: ${chalk.cyan(`"${deploymentDescription}"`)}. Continue?`,
      "N"
    )
    if (!confirmed) {
      Logger.info("Deployment cancelled by user.")
      return
    }
  }

  Logger.info("Creating deployment from remote 'build' path...")
  Logger.info(`Description: ${chalk.cyan(`"${deploymentDescription}"`)}`)

  const spinner = silent ? null : ora("Creating deployment...").start()
  await deployWithRetry("build", deploymentDescription)
  spinner?.succeed()

  Logger.success("Deployment created successfully!")

  writeFile(path.join(projectPath, ".nostocache/hash"), remoteHash)
}
