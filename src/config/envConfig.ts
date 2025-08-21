import { type PartialConfig, PartialConfigSchema, type PersistentConfig } from "#config/schema.ts"

export const EnvVariables = {
  apiKey: "NOSTO_API_KEY",
  merchant: "NOSTO_MERCHANT",
  templatesEnv: "NOSTO_TEMPLATES_ENV",
  apiUrl: "NOSTO_API_URL",
  libraryUrl: "NOSTO_LIBRARY_URL",
  logLevel: "NOSTO_LOG_LEVEL",
  maxRequests: "NOSTO_MAX_REQUESTS"
} satisfies Record<keyof PersistentConfig, string>

export function getEnvConfig(): PartialConfig {
  const config = Object.entries(EnvVariables).reduce<Record<string, string>>((acc, [key, envVar]) => {
    const value = process.env[envVar]
    if (value) {
      acc[key] = value
    }
    return acc
  }, {})

  return PartialConfigSchema.parse(config)
}
