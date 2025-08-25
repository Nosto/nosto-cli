import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { EnvVariables, getEnvConfig } from "#config/envConfig.ts"

describe("Env Config", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {}
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("getEnvConfig", () => {
    it("should return empty config when no environment variables are set", () => {
      const result = getEnvConfig()
      expect(result).toEqual({})
    })

    it("should parse environment variables correctly", () => {
      process.env[EnvVariables.apiKey] = "env-api-key"
      process.env[EnvVariables.merchant] = "env-merchant"
      process.env[EnvVariables.logLevel] = "debug"
      process.env[EnvVariables.maxRequests] = "25"

      const result = getEnvConfig()

      expect(result).toEqual(
        expect.objectContaining({
          apiKey: "env-api-key",
          merchant: "env-merchant",
          logLevel: "debug",
          maxRequests: 25 // Coerced to number by schema
        })
      )
    })

    it("should handle all possible environment variables", () => {
      process.env[EnvVariables.apiKey] = "another-key"
      process.env[EnvVariables.merchant] = "another-merchant"
      process.env[EnvVariables.templatesEnv] = "staging"
      process.env[EnvVariables.apiUrl] = "https://custom-api.com"
      process.env[EnvVariables.libraryUrl] = "https://custom-library.com"
      process.env[EnvVariables.logLevel] = "warn"
      process.env[EnvVariables.maxRequests] = "50"

      const result = getEnvConfig()

      expect(result).toEqual({
        apiKey: "another-key",
        merchant: "another-merchant",
        templatesEnv: "staging",
        apiUrl: "https://custom-api.com",
        libraryUrl: "https://custom-library.com",
        logLevel: "warn",
        maxRequests: 50 // Coerced to number by schema
      })
    })
  })
})
