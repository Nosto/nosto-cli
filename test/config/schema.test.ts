import { describe, it, expect } from "vitest"
import { PersistentConfigSchema, RuntimeConfigSchema, LogLevel } from "#config/schema.ts"

describe("Config Schema", () => {
  describe("PersistentConfigSchema", () => {
    it("should validate valid configuration", () => {
      const validConfig = {
        apiKey: "test-api-key",
        merchant: "test-merchant"
      }

      const result = PersistentConfigSchema.parse(validConfig)

      expect(result.apiKey).toBe("test-api-key")
      expect(result.merchant).toBe("test-merchant")
      expect(result.templatesEnv).toBe("main") // default value
      expect(result.apiUrl).toBe("https://api.nosto.com") // default value
      expect(result.logLevel).toBe("info") // default value
    })

    it("should apply default values", () => {
      const minimalConfig = {
        apiKey: "test-key",
        merchant: "test-merchant"
      }

      const result = PersistentConfigSchema.parse(minimalConfig)

      expect(result.templatesEnv).toBe("main")
      expect(result.apiUrl).toBe("https://api.nosto.com")
      expect(result.libraryUrl).toBe("https://d11ffvpvtnmt0d.cloudfront.net/library")
      expect(result.logLevel).toBe("info")
      expect(result.maxRequests).toBe(15)
    })

    it("should validate log level enum", () => {
      LogLevel.forEach(level => {
        const config = {
          apiKey: "test-key",
          merchant: "test-merchant",
          logLevel: level
        }

        const result = PersistentConfigSchema.parse(config)
        expect(result.logLevel).toBe(level)
      })
    })

    it("should coerce maxRequests to number", () => {
      const config = {
        apiKey: "test-key",
        merchant: "test-merchant",
        maxRequests: "20" as unknown
      }

      const result = PersistentConfigSchema.parse(config)
      expect(result.maxRequests).toBe(20)
      expect(typeof result.maxRequests).toBe("number")
    })

    it("should throw on invalid log level", () => {
      const invalidConfig = {
        apiKey: "test-key",
        merchant: "test-merchant",
        logLevel: "invalid-level"
      }

      expect(() => PersistentConfigSchema.parse(invalidConfig)).toThrow()
    })

    it("should require apiKey and merchant", () => {
      expect(() => PersistentConfigSchema.parse({})).toThrow()
      expect(() => PersistentConfigSchema.parse({ apiKey: "test" })).toThrow()
      expect(() => PersistentConfigSchema.parse({ merchant: "test" })).toThrow()
    })
  })

  describe("RuntimeConfigSchema", () => {
    it("should apply default values", () => {
      const result = RuntimeConfigSchema.parse({})

      expect(result.projectPath).toBe(".")
      expect(result.dryRun).toBe(false)
      expect(result.verbose).toBe(false)
    })

    it("should parse provided values", () => {
      const config = {
        projectPath: "/custom/path",
        dryRun: true,
        verbose: true
      }

      const result = RuntimeConfigSchema.parse(config)

      expect(result.projectPath).toBe("/custom/path")
      expect(result.dryRun).toBe(true)
      expect(result.verbose).toBe(true)
    })
  })
})
