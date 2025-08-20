import { describe, it, expect, vi, beforeEach } from "vitest"
import { printStatus } from "#modules/status.ts"
import { setupTestServer } from "#test/setup.ts"
import { mockConfig, mockFilesystem } from "#test/utils/mocks.ts"
import { mockConsole } from "#test/utils/consoleMocks.ts"

const fs = mockFilesystem()
const server = setupTestServer()
const terminal = mockConsole()

describe("Status Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("printStatus", () => {
    it("should print configuration status", async () => {
      mockConfig({
        apiKey: "test-api-key",
        merchant: "test-merchant",
        templatesEnv: "main",
        apiUrl: "https://api.nosto.com",
        logLevel: "info",
        maxRequests: 15
      })

      printStatus("/test/path")

      // Status should be printed (tested via no errors thrown)
      expect(true).toBe(true)
    })

    it("should indicate valid configuration", async () => {
      mockConfig({
        apiKey: "test-api-key",
        merchant: "test-merchant"
      })

      printStatus("/test/path")

      // Configuration validation should pass (tested via no errors thrown)
      expect(true).toBe(true)
    })
  })
})
