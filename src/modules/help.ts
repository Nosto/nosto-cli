import { EnvVariables } from "../config/envConfig.ts"
import { Logger } from "../logger/logger.ts"
import chalk from "chalk"

export function printSetupHelp() {
  Logger.raw(chalk.bold("\n=== Nosto CLI Configuration ===\n"))

  Logger.raw(chalk.cyan("Configuration Methods:"))
  Logger.raw("• Configuration file (`.nosto.json` in project root)")
  Logger.raw("• Environment variables\n")

  Logger.raw(chalk.cyan("Configuration Parameters:"))

  // Required parameters
  Logger.raw(chalk.yellow("Required Parameters:"))
  Logger.raw(chalk.bold("API Key:"))
  Logger.raw(`  • Config file: ${chalk.cyan("apiKey")}`)
  Logger.raw(`  • Env variable: ${chalk.magenta(EnvVariables.apiKey)}`)
  Logger.raw(`  • Description: Your Nosto API key\n`)

  Logger.raw(chalk.bold("Merchant ID:"))
  Logger.raw(`  • Config file: ${chalk.cyan("merchant")}`)
  Logger.raw(`  • Env variable: ${chalk.magenta(EnvVariables.merchant)}`)
  Logger.raw(`  • Description: Your merchant ID\n`)

  // Optional parameters
  Logger.raw(chalk.yellow("Optional Parameters:"))

  Logger.raw(chalk.bold("Templates Environment:"))
  Logger.raw(`  • Config file: ${chalk.cyan("templatesEnv")}`)
  Logger.raw(`  • Env variable: ${chalk.magenta(EnvVariables.templatesEnv)}`)
  Logger.raw(`  • Description: Nosto templates environment`)
  Logger.raw(`  • Default: ${chalk.green("main")}\n`)

  Logger.raw(chalk.bold("API URL:"))
  Logger.raw(`  • Config file: ${chalk.cyan("apiUrl")}`)
  Logger.raw(`  • Env variable: ${chalk.magenta(EnvVariables.apiUrl)}`)
  Logger.raw(`  • Description: Nosto API URL`)
  Logger.raw(`  • Default: ${chalk.green("https://my.nosto.com")}\n`)

  Logger.raw(chalk.bold("Log Level:"))
  Logger.raw(`  • Config file: ${chalk.cyan("logLevel")}`)
  Logger.raw(`  • Env variable: ${chalk.magenta(EnvVariables.logLevel)}`)
  Logger.raw(`  • Description: Output log level`)
  Logger.raw(`  • Default: ${chalk.green("info")}\n`)

  Logger.raw(chalk.dim("Example configuration file:"))
  Logger.raw(chalk.dim("{"))
  Logger.raw(chalk.dim('  "apiKey": "YOUR_API_KEY",'))
  Logger.raw(chalk.dim('  "merchant": "YOUR_MERCHANT_ID",'))
  Logger.raw(chalk.dim('  "templatesEnv": "main",'))
  Logger.raw(chalk.dim('  "apiUrl": "https://my.nosto.com",'))
  Logger.raw(chalk.dim('  "logLevel": "info"'))
  Logger.raw(chalk.dim("}"))
  Logger.raw(chalk.dim(""))
  Logger.raw(chalk.cyan("Note: Environment variables take precedence over configuration file."))
}
