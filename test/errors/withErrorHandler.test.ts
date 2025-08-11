import { describe, it, expect, vi, beforeEach } from "vitest"
import { withErrorHandler } from "../../src/errors/withErrorHandler.ts"
import { MissingConfigurationError } from "../../src/errors/MissingConfigurationError.ts"

// Mock logger
vi.mock("../../src/console/logger.ts", () => ({
  Logger: {
    error: vi.fn(),
    info: vi.fn(),
    raw: vi.fn()
  }
}))
vi.mock("../../src/config/config.ts", () => ({
  getCachedConfig: vi.fn(() => ({ verbose: false }))
}))

describe("Error Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("withErrorHandler", () => {
    it("should execute function without error handling if no error occurs", async () => {
      const mockFn = vi.fn()

      await withErrorHandler(mockFn)

      expect(mockFn).toHaveBeenCalled()
    })

    it("should handle MissingConfigurationError", async () => {
      const { Logger } = await import("../../src/console/logger.ts")
      const mockFn = vi.fn(() => {
        throw new MissingConfigurationError("Test config error")
      })

      await withErrorHandler(mockFn)

      expect(Logger.error).toHaveBeenCalledWith("Test config error")
    })

    it("should rethrow unknown errors", async () => {
      const unknownError = new Error("Unknown error")
      const mockFn = vi.fn(() => {
        throw unknownError
      })

      await expect(withErrorHandler(mockFn)).rejects.toThrow("Unknown error")
    })
  })
})
