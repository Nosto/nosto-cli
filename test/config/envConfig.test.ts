import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getEnvConfig, EnvVariables } from "../../src/config/envConfig.ts"

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

      expect(result).toEqual({
        apiKey: "env-api-key",
        merchant: "env-merchant",
        logLevel: "debug",
        maxRequests: 25 // Note: coerced to number by schema
      })
    })

    it("should ignore undefined environment variables", () => {
      process.env[EnvVariables.apiKey] = "test-key"
      delete process.env[EnvVariables.merchant]
      process.env[EnvVariables.logLevel] = "info"

      const result = getEnvConfig()

      expect(result).toEqual({
        apiKey: "test-key",
        logLevel: "info"
      })
    })

    it("should handle all possible environment variables", () => {
      process.env[EnvVariables.apiKey] = "test-key"
      process.env[EnvVariables.merchant] = "test-merchant"
      process.env[EnvVariables.templatesEnv] = "staging"
      process.env[EnvVariables.apiUrl] = "https://custom-api.com"
      process.env[EnvVariables.libraryUrl] = "https://custom-library.com"
      process.env[EnvVariables.logLevel] = "warn"
      process.env[EnvVariables.maxRequests] = "50"

      const result = getEnvConfig()

      expect(result).toEqual({
        apiKey: "test-key",
        merchant: "test-merchant",
        templatesEnv: "staging",
        apiUrl: "https://custom-api.com",
        libraryUrl: "https://custom-library.com",
        logLevel: "warn",
        maxRequests: 50 // Note: coerced to number by schema
      })
    })
  })

  describe("EnvVariables", () => {
    it("should have all required environment variable names", () => {
      expect(EnvVariables).toEqual({
        apiKey: "NOSTO_API_KEY",
        merchant: "NOSTO_MERCHANT",
        templatesEnv: "NOSTO_TEMPLATES_ENV",
        apiUrl: "NOSTO_API_URL",
        libraryUrl: "NOSTO_LIBRARY_URL",
        logLevel: "NOSTO_LOG_LEVEL",
        maxRequests: "NOSTO_MAX_REQUESTS"
      })
    })
  })
})
