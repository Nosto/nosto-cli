import { select } from "@inquirer/prompts"
import chalk from "chalk"

import { listDeployments } from "#api/deployments/listDeployments.ts"
import { redeploy } from "#api/deployments/redeploy.ts"
import { Logger } from "#console/logger.ts"
import { promptForConfirmation } from "#console/userPrompt.ts"
import { formatDate } from "#utils/formatDate.ts"

type RedeployOptions = {
  deploymentId?: string
  force: boolean
}

export async function deploymentsRedeploy({ deploymentId, force }: RedeployOptions) {
  let selectedDeploymentId = deploymentId

  if (!selectedDeploymentId) {
    const deployments = await listDeployments()

    if (!deployments || deployments.length === 0) {
      Logger.error("No deployments found. Please create a deployment first.")
      return
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

    selectedDeploymentId = await select({
      message: "Select a deployment to redeploy:",
      choices,
      pageSize: 10
    })

    if (!selectedDeploymentId) {
      Logger.error("No deployment selected. Aborting.")
      return
    }
  }

  const deployments = await listDeployments()
  const selectedDeployment = deployments.find(d => d.id === selectedDeploymentId)

  if (!selectedDeployment) {
    Logger.error(`Deployment with ID "${selectedDeploymentId}" not found.`)
    return
  }

  Logger.info(`\nSelected deployment: ${chalk.cyan(selectedDeploymentId)}`)
  if (selectedDeployment.description) {
    Logger.info(`Description: ${selectedDeployment.description}`)
  }

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

  Logger.success("Redeployment created successfully!")
}
