import chalk from "chalk"
import { getCachedConfig, loadConfig } from "../config/config.ts"
import { Logger } from "../logger/logger.ts"

export function printStatus(configurationPath: string) {
  loadConfig(configurationPath)
  const config = getCachedConfig()

  Logger.raw(chalk.bold("\n=== Nosto CLI Configuration Status ===\n"))

  const shorterApiKey = config.apiKey.slice(0, 6) + "[...]" + config.apiKey.slice(-4)

  // Required settings
  Logger.raw(chalk.yellow("Required Settings:"))
  Logger.raw(`  ${chalk.bold("API Key:")}         ${chalk.cyan(shorterApiKey)}`)
  Logger.raw(`  ${chalk.bold("Merchant ID:")}     ${chalk.cyan(config.merchant)}\n`)

  // Optional settings
  Logger.raw(chalk.yellow("Optional Settings:"))
  Logger.raw(`  ${chalk.bold("Templates Env:")} ${chalk.cyan(config.templatesEnv)}`)
  Logger.raw(`  ${chalk.bold("API URL:")}       ${chalk.cyan(config.apiUrl)}`)
  Logger.raw(`  ${chalk.bold("Log Level:")}     ${chalk.cyan(config.logLevel)}\n`)

  Logger.raw(chalk.dim("Configuration loaded successfully"))
}
