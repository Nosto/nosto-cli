import { Logger } from "../logger/logger.ts"
import { printSetupHelp } from "../modules/help.ts"
import { getEnvConfig } from "./envConfig.ts"
import { parseConfigFile } from "./fileConfig.ts"
import { type Config, ConfigSchema } from "./schema.ts"
import { resolve } from "path"

let cachedConfig: Config | null = null

export function loadConfig(targetPath: string) {
  if (cachedConfig) {
    Logger.debug(`Using cached configuration`)
    return cachedConfig
  }

  const fullPath = resolve(targetPath)
  Logger.info(`Loading configuration for project: ${fullPath}`)
  const envConfig = getEnvConfig()
  const fileConfig = parseConfigFile(targetPath)

  const combinedConfig = {
    ...fileConfig,
    ...envConfig
  }
  if (!combinedConfig.apiKey) {
    Logger.error("Missing API key.")
    printSetupHelp()
    throw new Error("Missing API key")
  }
  if (!combinedConfig.merchant) {
    Logger.error("Missing merchant ID.")
    printSetupHelp()
    throw new Error("Missing merchant ID")
  }

  try {
    cachedConfig = ConfigSchema.parse(combinedConfig)
    Logger.logLevel = cachedConfig.logLevel
    return cachedConfig
  } catch (error) {
    Logger.error("Failed to load configuration", error)
    throw new Error("Failed to load configuration")
  }
}

export function getCachedConfig() {
  if (!cachedConfig) {
    Logger.error("Config not loaded")
    throw new Error("Config not loaded")
  }
  return cachedConfig
}
