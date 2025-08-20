import { describe, it, expect, vi, beforeEach } from "vitest"
import { parseConfigFile } from "../../src/config/fileConfig.ts"
import { mockFilesystem } from "#test/utils/mocks.ts"

const fs = mockFilesystem()

describe("File Config", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("parseConfigFile", () => {
    it("should return empty object when config file does not exist", () => {
      const result = parseConfigFile(".")
      expect(result).toEqual({})
    })

    it("should parse valid JSON config file", () => {
      const mockConfig = {
        apiKey: "test-key",
        merchant: "test-merchant",
        logLevel: "debug"
      }

      fs.createFile(".nosto.json", JSON.stringify(mockConfig))

      const result = parseConfigFile(".")

      expect(result).toEqual(mockConfig)
    })

    it("should throw error for invalid JSON", () => {
      fs.createFile(".nosto.json", "invalid json")

      expect(() => parseConfigFile(".")).toThrow("Invalid JSON in configuration file")
    })

    it("should throw error for invalid config schema", () => {
      const invalidConfig = {
        apiKey: "test-key",
        logLevel: "invalid-level"
      }

      fs.createFile(".nosto.json", JSON.stringify(invalidConfig))

      expect(() => parseConfigFile(".")).toThrow("Invalid configuration file")
    })
  })
})
