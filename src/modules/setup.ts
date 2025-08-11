import { EnvVariables } from "#config/envConfig.ts"
import { Logger } from "#console/logger.ts"
import chalk from "chalk"
import path from "path"
import fs from "fs"
import { promptForConfirmation } from "#console/userPrompt.ts"
import { writeFile } from "#filesystem/filesystem.ts"
import { getDefaultConfig } from "#config/config.ts"

export async function printSetupHelp(projectPath: string) {
  const defaultConfig = getDefaultConfig()

  Logger.info(chalk.cyan(chalk.bold("Configuration Methods:")))
  Logger.info(`  • Configuration file (${chalk.cyan(".nosto.json")} in project root)`)
  Logger.info("  • Environment variables\n")

  Logger.info(chalk.bold("Note: ") + "Environment variables take precedence over the configuration file.\n")

  // Required parameters
  Logger.info(chalk.yellow(chalk.bold("Required Parameters:")))
  Logger.info(chalk.bold("API Key:"))
  Logger.info(`  • Config file: ${chalk.cyan("apiKey")}`)
  Logger.info(`  • Env variable: ${chalk.magenta(EnvVariables.apiKey)}`)
  Logger.info(`  • Your Nosto API key\n`)

  Logger.info(chalk.bold("Merchant ID:"))
  Logger.info(`  • Config file: ${chalk.cyan("merchant")}`)
  Logger.info(`  • Env variable: ${chalk.magenta(EnvVariables.merchant)}`)
  Logger.info(`  • Your merchant ID\n`)

  // Optional parameters
  Logger.info(chalk.yellow(chalk.bold("Optional Parameters:")))

  Logger.info(chalk.bold("Templates Environment:"))
  Logger.info(`  • Config file: ${chalk.cyan("templatesEnv")}`)
  Logger.info(`  • Env variable: ${chalk.magenta(EnvVariables.templatesEnv)}`)
  Logger.info(`  • Nosto templates environment`)
  Logger.info(`  • Default: ${chalk.green(defaultConfig.templatesEnv)}\n`)

  Logger.info(chalk.bold("API URL:"))
  Logger.info(`  • Config file: ${chalk.cyan("apiUrl")}`)
  Logger.info(`  • Env variable: ${chalk.magenta(EnvVariables.apiUrl)}`)
  Logger.info(`  • Nosto API URL`)
  Logger.info(`  • Default: ${chalk.green(defaultConfig.apiUrl)}\n`)

  Logger.info(chalk.bold("Log Level:"))
  Logger.info(`  • Config file: ${chalk.cyan("logLevel")}`)
  Logger.info(`  • Env variable: ${chalk.magenta(EnvVariables.logLevel)}`)
  Logger.info(`  • Output log level`)
  Logger.info(`  • Default: ${chalk.green(defaultConfig.logLevel)}\n`)

  Logger.info(chalk.bold("Max Requests:"))
  Logger.info(`  • Config file: ${chalk.cyan("maxRequests")}`)
  Logger.info(`  • Env variable: ${chalk.magenta(EnvVariables.maxRequests)}`)
  Logger.info(`  • Maximum number of requests in flight at the same time`)
  Logger.info(`  • Default: ${chalk.green(defaultConfig.maxRequests)}\n`)

  const configFilePath = path.join(projectPath, ".nosto.json")
  if (fs.existsSync(configFilePath)) {
    return
  }

  Logger.warn("Configuration file not found in project directory.")

  Logger.info(chalk.greenBright("Placeholder config:"))
  Logger.info(chalk.dim("{"))
  Logger.info(chalk.dim('  "apiKey": "YOUR_API_KEY (Nosto API_APPS token)",'))
  Logger.info(chalk.dim('  "merchant": "YOUR_MERCHANT_ID",'))
  Logger.info(chalk.dim(`  "templatesEnv": "${defaultConfig.templatesEnv}",`))
  Logger.info(chalk.dim(`  "apiUrl": "${defaultConfig.apiUrl}",`))
  Logger.info(chalk.dim(`  "logLevel": "${defaultConfig.logLevel}",`))
  Logger.info(chalk.dim(`  "maxRequests": ${defaultConfig.maxRequests}`))
  Logger.info(chalk.dim("}"))

  const confirmed = await promptForConfirmation(`Would you like to create a placeholder configuration file?`, "Y")
  if (confirmed) {
    writeFile(configFilePath, JSON.stringify(defaultConfig, null, 2) + "\n")

    const resolvedPath = path.resolve(configFilePath)
    Logger.info(`Created configuration file in ${chalk.cyan(resolvedPath)}`)
  }
}
