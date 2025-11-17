import { resolve } from "path"

import { cleanUrl } from "#api/utils.ts"
import { Logger } from "#console/logger.ts"
import { MissingConfigurationError } from "#errors/MissingConfigurationError.ts"

import { authFileExists, getAuthFileMissingError, parseAuthFile } from "./authConfig.ts"
import { getEnvConfig } from "./envConfig.ts"
import { parseConfigFile } from "./fileConfig.ts"
import {
  AuthConfigSchema,
  type Config,
  PersistentConfigSchema,
  RuntimeConfigSchema,
  SearchTemplatesConfigSchema
} from "./schema.ts"
import { parseSearchTemplatesConfigFile } from "./searchTemplatesConfig.ts"

let isConfigLoaded = false
const defaultCachedConfig: Config = {
  ...getDefaultConfig(),
  auth: AuthConfigSchema.parse({
    user: "",
    token: "",
    expiresAt: new Date(0)
  }),
  searchTemplates: {
    mode: "unknown",
    data: SearchTemplatesConfigSchema.parse({})
  },
  ...RuntimeConfigSchema.parse({})
}
let cachedConfig = defaultCachedConfig

export type LoadConfigProps = {
  projectPath: string
  options: object
  allowIncomplete?: boolean
}

export async function loadConfig({ projectPath, options, allowIncomplete }: LoadConfigProps) {
  const { dryRun, verbose } = RuntimeConfigSchema.parse({ ...options, projectPath })

  if (isConfigLoaded) {
    Logger.debug(`Using cached configuration`)
    return cachedConfig
  }

  const fullPath = resolve(projectPath)
  Logger.debug(`Loading configuration from folder: ${fullPath}`)
  if (!allowIncomplete && !authFileExists()) {
    throw getAuthFileMissingError()
  }
  const authConfig = parseAuthFile({ allowIncomplete })
  const searchTemplatesConfig = await parseSearchTemplatesConfigFile({ projectPath })
  const fileConfig = parseConfigFile({ projectPath, allowIncomplete })
  const envConfig = getEnvConfig()

  const baseConfig = allowIncomplete ? getDefaultConfig() : {}

  const combinedConfig = {
    ...baseConfig,
    ...fileConfig,
    ...envConfig
  }
  if (!combinedConfig.merchant && !allowIncomplete) {
    throw new MissingConfigurationError("Invalid configuration: Missing merchant ID")
  }

  try {
    const persistentConfig = PersistentConfigSchema.parse(combinedConfig)
    cachedConfig = {
      ...persistentConfig,
      auth: authConfig,
      searchTemplates: searchTemplatesConfig,
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
  return cachedConfig
}
export function getCachedSearchTemplatesConfig() {
  return cachedConfig.searchTemplates.data
}

export function getDefaultConfig() {
  return PersistentConfigSchema.parse({
    merchant: ""
  })
}

export function clearCachedConfig() {
  isConfigLoaded = false
  cachedConfig = defaultCachedConfig
}
