import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import * as config from "#config/config.ts"
import { PersistentConfigSchema } from "#config/schema.ts"
import { MissingConfigurationError } from "#errors/MissingConfigurationError.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()

describe("Config Tests for 100% Coverage", () => {
  beforeEach(() => {
    // Clear environment variables
    process.env = {}

    // Clear all mocks
    vi.clearAllMocks()

    // Reset module state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configModule = config as any
    configModule.isConfigLoaded = false
    configModule.cachedConfig = {
      ...config.getDefaultConfig(),
      projectPath: ".",
      dryRun: false,
      verbose: false
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getDefaultConfig", () => {
    it("should return correct default configuration", () => {
      const defaultConfig = config.getDefaultConfig()

      expect(defaultConfig).toEqual({
        apiKey: "",
        merchant: "",
        templatesEnv: "main",
        apiUrl: "https://api.nosto.com",
        libraryUrl: "https://d11ffvpvtnmt0d.cloudfront.net/library",
        logLevel: "info",
        maxRequests: 15
      })
    })
  })

  describe("loadConfig - Schema parse error (lines 61-62)", () => {
    it("should throw 'Failed to load configuration' when schema parsing fails", () => {
      // Reset module state first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configModule = config as any
      configModule.isConfigLoaded = false

      // Create a valid config file
      const mockConfig = {
        apiKey: "test-api-key",
        merchant: "test-merchant"
      }
      fs.writeFile(".nosto.json", JSON.stringify(mockConfig))

      // Mock PersistentConfigSchema.parse to throw an error
      const originalParse = PersistentConfigSchema.parse
      const mockError = new Error("Schema validation failed")

      vi.spyOn(PersistentConfigSchema, "parse").mockImplementation(() => {
        throw mockError
      })

      try {
        expect(() =>
          config.loadConfig({
            projectPath: ".",
            options: {}
          })
        ).toThrow("Failed to load configuration")
      } finally {
        // Restore the original function
        PersistentConfigSchema.parse = originalParse
      }
    })
  })

  describe("loadConfig - Missing configuration validation", () => {
    it("should throw MissingConfigurationError when apiKey is missing", () => {
      // Reset module state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configModule = config as any
      configModule.isConfigLoaded = false

      const mockConfig = {
        merchant: "test-merchant"
      }
      fs.writeFile(".nosto.json", JSON.stringify(mockConfig))

      expect(() =>
        config.loadConfig({
          projectPath: ".",
          options: {}
        })
      ).toThrow(MissingConfigurationError)
    })

    it("should throw MissingConfigurationError when merchant is missing", () => {
      // Reset module state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configModule = config as any
      configModule.isConfigLoaded = false

      const mockConfig = {
        apiKey: "test-api-key"
      }
      fs.writeFile(".nosto.json", JSON.stringify(mockConfig))

      expect(() =>
        config.loadConfig({
          projectPath: ".",
          options: {}
        })
      ).toThrow(MissingConfigurationError)
    })
  })

  describe("loadConfig - Verbose flag behavior", () => {
    it("should set logLevel to debug when verbose is true", () => {
      // Reset module state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configModule = config as any
      configModule.isConfigLoaded = false

      const mockConfig = {
        apiKey: "test-api-key",
        merchant: "test-merchant",
        logLevel: "info"
      }
      fs.writeFile(".nosto.json", JSON.stringify(mockConfig))

      const result = config.loadConfig({
        projectPath: ".",
        options: { verbose: true }
      })

      expect(result.logLevel).toBe("debug")
    })
  })

  describe("loadConfig - Caching behavior", () => {
    it("should return cached config when already loaded", () => {
      // Reset and load config first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configModule = config as any
      configModule.isConfigLoaded = false

      const mockConfig = {
        apiKey: "test-api-key",
        merchant: "test-merchant"
      }
      fs.writeFile(".nosto.json", JSON.stringify(mockConfig))

      const firstResult = config.loadConfig({
        projectPath: ".",
        options: { dryRun: false, verbose: false }
      })

      // Now isConfigLoaded should be true, so this should return cached
      const secondResult = config.loadConfig({
        projectPath: "/different",
        options: { dryRun: true, verbose: true }
      })

      expect(secondResult).toBe(firstResult)
    })
  })

  describe("loadConfig - Basic functionality", () => {
    it("should load configuration successfully", () => {
      // Reset module state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configModule = config as any
      configModule.isConfigLoaded = false

      const mockConfig = {
        apiKey: "test-api-key",
        merchant: "test-merchant"
      }
      fs.writeFile(".nosto.json", JSON.stringify(mockConfig))

      const result = config.loadConfig({
        projectPath: ".",
        options: {}
      })

      expect(result.apiKey).toBe("test-api-key")
      expect(result.merchant).toBe("test-merchant")
      expect(result.projectPath).toBe(".")
    })
  })

  describe("getCachedConfig", () => {
    it("should return cached config when available", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configModule = config as any
      configModule.isConfigLoaded = false

      const mockConfig = {
        apiKey: "test-api-key",
        merchant: "test-merchant"
      }
      fs.writeFile(".nosto.json", JSON.stringify(mockConfig))

      // Load config first
      const loadedConfig = config.loadConfig({
        projectPath: ".",
        options: {}
      })

      // Get cached config
      const cachedConfig = config.getCachedConfig()

      expect(cachedConfig).toBe(loadedConfig)
    })
  })
})
