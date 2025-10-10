import chalk from "chalk"

import { getCachedConfig, loadConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { MissingConfigurationError } from "#errors/MissingConfigurationError.ts"

export async function printStatus(projectPath: string) {
  try {
    await loadConfig({ projectPath, options: {} })
  } catch (error) {
    if (error instanceof MissingConfigurationError) {
      Logger.error("Some required configuration is missing\n")
    } else {
      throw error
    }
  }
  const { apiKey, apiUrl, logLevel, maxRequests, auth, merchant, templatesEnv } = getCachedConfig()
  const { user, token, expiresAt } = auth

  const notSet = chalk.redBright("Not set")
  const formattedApiKey = apiKey ? chalk.greenBright(apiKey.slice(0, 6) + "[...]" + apiKey.slice(-4)) : notSet
  const authToken = token ? chalk.greenBright(token.slice(0, 6) + "[...]" + token.slice(-4)) : notSet
  const merchantId = merchant ? chalk.greenBright(merchant) : notSet

  // Authentication
  Logger.info(chalk.yellow("Authentication:"))
  Logger.info(`  ${chalk.bold("User:")}          ${user ? chalk.cyan(user) : notSet}`)
  Logger.info(`  ${chalk.bold("Token:")}         ${token ? authToken : notSet}`)
  Logger.info(`  ${chalk.bold("Expires At:")}    ${expiresAt.getTime() > 0 ? chalk.cyan(expiresAt) : notSet}`)
  Logger.info("")

  // Required settings
  Logger.info(chalk.yellow("Required Settings:"))
  Logger.info(`  ${chalk.bold("Merchant ID:")}   ${merchantId}\n`)

  // Optional settings
  Logger.info(chalk.yellow("Optional Settings:"))
  Logger.info(`  ${chalk.bold("API Key:")}       ${formattedApiKey}`)
  Logger.info(`  ${chalk.bold("Templates Env:")} ${chalk.cyan(templatesEnv)}`)
  Logger.info(`  ${chalk.bold("API URL:")}       ${chalk.cyan(apiUrl)}`)
  Logger.info(`  ${chalk.bold("Log Level:")}     ${chalk.cyan(logLevel)}`)
  Logger.info(`  ${chalk.bold("Max Requests:")}  ${chalk.cyan(maxRequests)}`)

  Logger.info("")
  const userAuthPresent = user && token && expiresAt.getTime() > 0
  const userAuthValid = userAuthPresent && expiresAt.getTime() > Date.now()
  const errors = []
  if (!merchant) {
    errors.push("Invalid configuration: Missing merchant ID")
  }
  if (!apiKey && !userAuthPresent) {
    errors.push("Invalid configuration: Missing authentication (use `nosto login` or provide an API key)")
  }
  if (!apiKey && userAuthPresent && !userAuthValid) {
    errors.push("Invalid configuration: Authentication token expired")
  }

  if (errors.length == 0) {
    Logger.info(chalk.dim("Configuration seems to be valid:"))
    if (apiKey) {
      Logger.info(chalk.dim("  - Using API key for authentication"))
    } else {
      Logger.info(chalk.dim("  - Using user account for authentication"))
    }
  } else {
    Logger.info(chalk.red("Configuration is not valid:"))
    for (const error of errors) {
      Logger.info(chalk.red("  - " + error))
    }
  }
}
