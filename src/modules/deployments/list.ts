import chalk from "chalk"

import { listDeployments } from "#api/deployments/listDeployments.ts"
import { Logger } from "#console/logger.ts"

export async function deploymentsList() {
  const deployments = await listDeployments()

  if (!deployments || deployments.length === 0) {
    Logger.info(chalk.yellow("No deployments found"))
    return
  }

  Logger.info(chalk.bold(`\nFound ${deployments.length} deployment(s):\n`))

  deployments.forEach((deployment, index) => {
    const statusBadge = deployment.active ? chalk.green("Active") : chalk.red("Inactive")
    const latestBadge = deployment.latest ? chalk.greenBright("[LATEST] ") : ""
    const createdDate = new Date(deployment.created * 1000).toUTCString()

    Logger.info(`${chalk.bgCyanBright("  ")} ${latestBadge}${chalk.blueBright(`ID: ${deployment.id}`)}`)
    Logger.info(`   ${chalk.bold("Status:")}      ${statusBadge}`)
    Logger.info(`   ${chalk.bold("Created At:")}  ${chalk.cyan(createdDate)}`)

    if (deployment.userId) {
      Logger.info(`   ${chalk.bold("User:")}        ${chalk.cyan(deployment.userId)}`)
    }

    if (deployment.description) {
      Logger.info(`   ${chalk.bold("Description:")} ${deployment.description}`)
    }

    if (index < deployments.length - 1) {
      Logger.info("")
    }
  })
}
