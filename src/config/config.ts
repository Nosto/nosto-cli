import { cleanUrl } from "../api/utils.ts"
import { Logger } from "../console/logger.ts"
import { MissingConfigurationError } from "../errors/MissingConfigurationError.ts"
import { getEnvConfig } from "./envConfig.ts"
import { parseConfigFile } from "./fileConfig.ts"
import { type Config, PersistentConfigSchema, type PersistentConfig, RuntimeConfigSchema } from "./schema.ts"
import { resolve } from "path"

let isConfigLoaded = false
let cachedConfig: Config = {
  ...getDefaultConfig(),
  ...RuntimeConfigSchema.parse({})
}

type Props = {
  projectPath: string
  options: object
}

export function loadConfig({ projectPath, options }: Props) {
  const { dryRun, verbose } = RuntimeConfigSchema.parse({ ...options, projectPath })

  if (isConfigLoaded) {
    Logger.debug(`Using cached configuration`)
    return cachedConfig
  }

  const fullPath = resolve(projectPath)
  Logger.debug(`Loading configuration from folder: ${fullPath}`)
  const fileConfig = parseConfigFile(projectPath)
  const envConfig = getEnvConfig()

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
    const persistentConfig = PersistentConfigSchema.parse(combinedConfig)
    cachedConfig = {
      ...persistentConfig,
      apiUrl: cleanUrl(persistentConfig.apiUrl),
      libraryUrl: cleanUrl(persistentConfig.libraryUrl),
      logLevel: verbose ? "debug" : persistentConfig.logLevel,
      projectPath,
      dryRun,
      verbose
    }
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

export function getCachedConfig() {
  if (!cachedConfig) {
    Logger.error("Config not loaded")
    throw new Error("Config not loaded")
  }
  return cachedConfig
}

export function getDefaultConfig(): PersistentConfig {
  return PersistentConfigSchema.parse({
    apiKey: "",
    merchant: ""
  })
}
