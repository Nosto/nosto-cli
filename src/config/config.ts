import { Logger } from "../console/logger.ts"
import { MissingConfigurationError } from "../errors/MissingConfigurationError.ts"
import { getEnvConfig } from "./envConfig.ts"
import { parseConfigFile } from "./fileConfig.ts"
import { type Config, ConfigSchema, type PartialConfig } from "./schema.ts"
import { resolve } from "path"

let isConfigLoaded = false
let cachedConfig: Config = getDefaultConfig()

export function loadConfig(targetPath: string) {
  if (isConfigLoaded) {
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
    throw new MissingConfigurationError("Missing API key")
  }
  if (!combinedConfig.merchant) {
    throw new MissingConfigurationError("Missing merchant ID")
  }

  try {
    cachedConfig = ConfigSchema.parse(combinedConfig)
    updateLoggerContext(cachedConfig)
    isConfigLoaded = true
    return cachedConfig
  } catch (error) {
    throw new Error("Failed to load configuration", { cause: error })
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

export function getDefaultConfig(): Config {
  return ConfigSchema.parse({
    apiKey: "",
    merchant: ""
  })
}
