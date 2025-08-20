import { describe, it, expect, vi, beforeEach } from "vitest"
import { withErrorHandler } from "#errors/withErrorHandler.ts"
import { MissingConfigurationError } from "#errors/MissingConfigurationError.ts"

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
      const mockFn = vi.fn(() => {
        throw new MissingConfigurationError("Test config error")
      })

      await withErrorHandler(mockFn)
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
