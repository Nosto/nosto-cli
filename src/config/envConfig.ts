import { type EnvironmentConfig, EnvironmentConfigSchema } from "./schema.ts"

export const EnvVariables = {
  apiKey: "NOSTO_API_KEY",
  merchant: "NOSTO_MERCHANT",
  templatesEnv: "NOSTO_TEMPLATES_ENV",
  apiUrl: "NOSTO_API_URL",
  libraryUrl: "NOSTO_LIBRARY_URL",
  logLevel: "NOSTO_LOG_LEVEL",
  maxRequests: "NOSTO_MAX_REQUESTS"
} satisfies Record<keyof EnvironmentConfig, string>

export function getEnvConfig(): EnvironmentConfig {
  const config = Object.entries(EnvVariables).reduce<Record<string, string>>((acc, [key, envVar]) => {
    const value = process.env[envVar]
    if (value) {
      acc[key] = value
    }
    return acc
  }, {})

  return EnvironmentConfigSchema.parse(config)
}
