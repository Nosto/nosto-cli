import { describe, expect, it } from "vitest"

import { parseConfigFile } from "#config/fileConfig.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()

describe("File Config", () => {
  describe("parseConfigFile", () => {
    it("should return empty object when config file does not exist", () => {
      const result = parseConfigFile(".")
      expect(result).toEqual({})
    })

    it("should parse valid JSON config file", () => {
      const mockConfig = {
        apiKey: "another-key",
        merchant: "another-merchant",
        logLevel: "debug",
        apiUrl: "https://api.nosto.com"
      }

      fs.writeFile(".nosto.json", JSON.stringify(mockConfig))

      const result = parseConfigFile(".")

      expect(result).toEqual({
        apiKey: "another-key",
        apiUrl: "https://api.nosto.com",
        libraryUrl: "https://d11ffvpvtnmt0d.cloudfront.net/library",
        logLevel: "debug",
        maxRequests: 15,
        merchant: "another-merchant",
        templatesEnv: "main"
      })
    })

    it("should throw error for invalid JSON", () => {
      fs.writeFile(".nosto.json", "invalid json")

      expect(() => parseConfigFile(".")).toThrow("Invalid JSON in configuration file")
    })

    it("should throw error for invalid config schema", () => {
      const invalidConfig = {
        apiKey: "test-key",
        logLevel: "invalid-level"
      }

      fs.writeFile(".nosto.json", JSON.stringify(invalidConfig))

      expect(() => parseConfigFile(".")).toThrow("Invalid configuration file")
    })

    it("should rethrow other errors", () => {
      fs.writeFolder(".nosto.json")

      expect(() => parseConfigFile(".")).toThrow("EISDIR: illegal operation on a directory, open '/.nosto.json'")
    })
  })
})
