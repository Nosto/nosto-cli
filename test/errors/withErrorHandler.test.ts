import { HTTPError, TimeoutError } from "ky"
import { describe, expect, it, vi } from "vitest"

import { MissingConfigurationError } from "#errors/MissingConfigurationError.ts"
import { withErrorHandler } from "#errors/withErrorHandler.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"

describe("Error Handler", () => {
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

  it("should handle HTTPError", async () => {
    setupMockConfig({ verbose: true })
    const mockFn = vi.fn(() => {
      throw new HTTPError(
        {
          status: 500,
          statusText: "Internal Server Error"
        } as Response,
        {
          method: "GET",
          url: "https://example.com/api"
        } as Request,
        {} as never
      )
    })

    await withErrorHandler(mockFn)
  })

  it("should handle HTTPError", async () => {
    setupMockConfig({ verbose: true })
    const mockFn = vi.fn(() => {
      throw new TimeoutError({
        method: "GET",
        url: "https://example.com/api"
      } as Request)
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
