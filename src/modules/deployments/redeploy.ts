import { select } from "@inquirer/prompts"
import chalk from "chalk"
import z from "zod"

import { listDeployments } from "#api/deployments/listDeployments.ts"
import { redeploy } from "#api/deployments/redeploy.ts"
import { ListDeploymentsSchema } from "#api/deployments/schema.ts"
import { Logger } from "#console/logger.ts"
import { promptForConfirmation } from "#console/userPrompt.ts"
import { formatDate } from "#utils/formatDate.ts"

type RedeployOptions = {
  deploymentId?: string
  force: boolean
}

export async function deploymentsRedeploy({ deploymentId, force }: RedeployOptions) {
  let selectedDeployment = null
  let selectedDeploymentId

  if (deploymentId) {
    selectedDeploymentId = deploymentId
    selectedDeployment = await findDeploymentById(selectedDeploymentId)

    if (!selectedDeployment) {
      Logger.error(`Deployment with ID "${selectedDeploymentId}" not found.`)
      return
    }
  } else {
    const result = await selectDeploymentInteractively("Select a deployment to redeploy:")

    if (!result) {
      Logger.error("No deployment selected. Aborting.")
      return
    }

    selectedDeploymentId = result.id
    selectedDeployment = result.deployment
  }

  displayDeploymentInfo(selectedDeployment)

  if (!force) {
    const confirmed = await promptForConfirmation(
      `Are you sure you want to redeploy deployment ${chalk.cyan(selectedDeploymentId)}?`,
      "N"
    )
    if (!confirmed) {
      Logger.info("Redeployment cancelled by user.")
      return
    }
  }

  Logger.info(`\nRedeploying deployment ${chalk.cyan(selectedDeploymentId)}...`)

  await redeploy(selectedDeploymentId)

  Logger.success("Redeploymed successfully!")
}

type Deployment = z.infer<typeof ListDeploymentsSchema>[number]

export async function selectDeploymentInteractively(message: string) {
  const deployments = await listDeployments()

  if (!deployments || deployments.length === 0) {
    Logger.error("No deployments found.")
    return null
  }

  Logger.info(chalk.gray(`\n${chalk.bgGreenBright("  ")} = Currently active deployment\n`))

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

export async function findDeploymentById(deploymentId: string): Promise<Deployment | null> {
  const deployments = await listDeployments()
  return deployments.find(d => d.id === deploymentId) || null
}

export function displayDeploymentInfo(deployment: Deployment): void {
  Logger.info(`\nSelected deployment: ${chalk.cyan(deployment.id)}`)
  if (deployment.description) {
    Logger.info(`Description: ${deployment.description}`)
  }
}
