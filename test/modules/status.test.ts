import { describe, it, expect, vi, beforeEach } from "vitest"
import { printStatus } from "../../src/modules/status.ts"

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
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

describe("Status Module", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("printStatus", () => {
    it("should print configuration status", async () => {
      const { Logger } = await import("../../src/console/logger.ts")

      printStatus("/test/path")

      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Required Settings:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("API Key:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Merchant ID:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Optional Settings:"))
    })

    it("should indicate valid configuration", async () => {
      const { Logger } = await import("../../src/console/logger.ts")

      printStatus("/test/path")

      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Configuration seems to be valid"))
    })
  })
})
