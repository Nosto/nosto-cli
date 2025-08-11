import { describe, it, expect, vi, beforeEach } from "vitest"
import { printStatus } from "../../src/modules/status.ts"
import { Logger } from "../../src/console/logger.ts"

// Mock dependencies
vi.mock("../../src/config/config.ts", () => ({
  loadConfig: vi.fn(),
  getCachedConfig: vi.fn(() => ({
    apiKey: "test-api-key",
    merchant: "test-merchant",
    templatesEnv: "main",
    apiUrl: "https://api.nosto.com",
    logLevel: "info",
    maxRequests: 15
  }))
}))

vi.mock("../../src/console/logger.ts", () => ({
  Logger: {
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe("Status Module", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("printStatus", () => {
    it("should print configuration status", () => {
      printStatus("/test/path")

      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Required Settings:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("API Key:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Merchant ID:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Optional Settings:"))
    })

    it("should indicate valid configuration", () => {
      printStatus("/test/path")

      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Configuration seems to be valid"))
    })
  })
})
