import chalk from "chalk"
import ora from "ora"

import { listDeployments } from "#api/deployments/listDeployments.ts"
import { Logger } from "#console/logger.ts"
import { formatDate } from "#utils/formatDate.ts"

type ListOptions = {
  silent: boolean
}

export async function deploymentsList({ silent }: ListOptions) {
  const spinner = silent ? null : ora("Collecting deployment data...").start()
  const deployments = await listDeployments()
  spinner?.succeed()

  if (!deployments || deployments.length === 0) {
    Logger.info(chalk.yellow("No deployments found"))
    return
  }

  Logger.info(chalk.bold(`Found ${deployments.length} deployment(s):`))

  deployments.forEach((deployment, index) => {
    const statusBadge = deployment.active ? chalk.green("Active") : chalk.red("Inactive")
    const latestBadge = deployment.latest ? chalk.greenBright("[LATEST] ") : ""
    const createdDate = formatDate(deployment.created)
    const bulletin = deployment.active ? chalk.bgGreenBright("  ") : "  "
    Logger.info(`${bulletin} ${latestBadge}${chalk.blueBright(`ID: ${deployment.id}`)}`)
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
