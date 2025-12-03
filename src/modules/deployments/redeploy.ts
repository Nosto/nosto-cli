import { select } from "@inquirer/prompts"
import chalk from "chalk"
import ora from "ora"

import { listDeployments } from "#api/deployments/listDeployments.ts"
import { updateDeployment } from "#api/deployments/updateDeployment.ts"
import { Logger } from "#console/logger.ts"
import { promptForConfirmation } from "#console/userPrompt.ts"
import { formatDate } from "#utils/formatDate.ts"

type RedeployOptions = {
  deploymentId?: string
  force: boolean
  silent: boolean
}

export async function deploymentsRedeploy({ deploymentId, force, silent }: RedeployOptions) {
  let selectedDeployment = null
  let selectedDeploymentId

  if (deploymentId) {
    selectedDeploymentId = deploymentId
    const spinner = silent ? null : ora("Collecting deployment data...").start()
    const deployments = await listDeployments()
    selectedDeployment = deployments.find(d => d.id === deploymentId) || null
    spinner?.stop()

    if (!selectedDeployment) {
      Logger.error(`Deployment with ID "${selectedDeploymentId}" not found.`)
      return
    }
  } else {
    const result = await selectDeploymentInteractively("Select a deployment to redeploy:", silent)

    if (!result) {
      Logger.error("No deployment selected. Aborting.")
      return
    }

    selectedDeploymentId = result.id
    selectedDeployment = result.deployment
  }

  Logger.info(`Selected deployment: ${chalk.cyan(selectedDeployment.id)}`)
  if (selectedDeployment.description) {
    Logger.info(`Description: ${selectedDeployment.description}`)
  }

  if (!force) {
    const confirmed = await promptForConfirmation(
      `Are you sure you want to redeploy version ${chalk.cyan(selectedDeploymentId)}?`,
      "N"
    )
    if (!confirmed) {
      Logger.info("Redeployment cancelled by user.")
      return
    }
  }

  const spinner = silent ? null : ora(`Redeploying version ${chalk.cyan(selectedDeploymentId)}...`).start()
  await updateDeployment(selectedDeploymentId)
  spinner?.succeed()

  Logger.success("Redeployed successfully!")
}

export async function selectDeploymentInteractively(message: string, silent: boolean) {
  const spinner = silent ? null : ora("Collecting deployment data...").start()
  const deployments = await listDeployments()
  spinner?.succeed()

  if (!deployments || deployments.length === 0) {
    Logger.error("No deployments found.")
    return null
  }

  Logger.info(chalk.gray(`${chalk.bgGreenBright("  ")} = Currently active deployment\n`))

  const choices = deployments.map(deployment => {
    const createdDate = formatDate(deployment.created)
    const statusBadge = deployment.active ? chalk.bgGreenBright("  ") : "  "
    const description = deployment.description ? ` - ${deployment.description}` : ""
    const idColor = deployment.active ? chalk.green : chalk.blueBright

    return {
      name: `${statusBadge} [${idColor(createdDate)}] ${idColor(deployment.id)}${description}`,
      value: deployment.id,
      description: deployment.description || "No description"
    }
  })

  const selectedId = await select({
    message,
    choices,
    pageSize: 10
  })

  if (!selectedId) {
    return null
  }

  const selectedDeployment = deployments.find(d => d.id === selectedId)
  return selectedDeployment ? { id: selectedId, deployment: selectedDeployment } : null
}
