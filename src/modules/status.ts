import chalk from "chalk"
import { getCachedConfig, loadConfig } from "../config/config.ts"
import { Logger } from "../console/logger.ts"
import { MissingConfigurationError } from "../errors/MissingConfigurationError.ts"

export function printStatus(projectPath: string) {
  try {
    loadConfig({ projectPath, options: {} })
  } catch (error) {
    if (error instanceof MissingConfigurationError) {
      Logger.error("Some required configuration is missing\n")
    } else {
      throw error
    }
  }
  const config = getCachedConfig()

  const apiKey = config.apiKey
    ? chalk.greenBright(config.apiKey.slice(0, 6) + "[...]" + config.apiKey.slice(-4))
    : chalk.redBright("Not set")
  const merchantId = config.merchant ? chalk.greenBright(config.merchant) : chalk.redBright("Not set")

  // Required settings
  Logger.info(chalk.yellow("Required Settings:"))
  Logger.info(`  ${chalk.bold("API Key:")}         ${apiKey}`)
  Logger.info(`  ${chalk.bold("Merchant ID:")}     ${merchantId}\n`)

  // Optional settings
  Logger.info(chalk.yellow("Optional Settings:"))
  Logger.info(`  ${chalk.bold("Templates Env:")} ${chalk.cyan(config.templatesEnv)}`)
  Logger.info(`  ${chalk.bold("API URL:")}       ${chalk.cyan(config.apiUrl)}`)
  Logger.info(`  ${chalk.bold("Log Level:")}     ${chalk.cyan(config.logLevel)}`)
  Logger.info(`  ${chalk.bold("Max Requests:")}  ${chalk.cyan(config.maxRequests)}`)

  Logger.info("")
  if (config.apiKey && config.merchant) {
    Logger.info(chalk.dim("Configuration seems to be valid"))
  } else {
    Logger.info(chalk.red("Configuration is not valid"))
  }
}
