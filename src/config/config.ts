import { Logger } from "../console/logger.ts"
import { printSetupHelp } from "../modules/setup.ts"
import { getEnvConfig } from "./envConfig.ts"
import { parseConfigFile } from "./fileConfig.ts"
import { type Config, ConfigSchema, type PartialConfig } from "./schema.ts"
import { resolve } from "path"

let cachedConfig: Config | null = null

export function loadConfig(targetPath: string) {
  if (cachedConfig) {
    Logger.debug(`Using cached configuration`)
    return cachedConfig
  }

  const fullPath = resolve(targetPath)
  Logger.debug(`Loading configuration from folder: ${fullPath}`)
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
    updateLoggerContext(cachedConfig)
    return cachedConfig
  } catch (error) {
    Logger.error("Failed to load configuration", error)
    throw new Error("Failed to load configuration")
  }
}

function updateLoggerContext(config: Config) {
  Logger.context = {
    logLevel: config.logLevel,
    merchantId: config.merchant,
    isDryRun: config.dryRun
  }
}

export function updateCachedConfig(config: PartialConfig) {
  cachedConfig = { ...cachedConfig, ...config } as Config
  updateLoggerContext(cachedConfig)
}

export function getCachedConfig() {
  if (!cachedConfig) {
    Logger.error("Config not loaded")
    throw new Error("Config not loaded")
  }
  return cachedConfig
}
