import { HTTPError, TimeoutError } from "ky"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { clearCachedConfig } from "#config/config.ts"
import { InvalidLoginResponseError } from "#errors/InvalidLoginResponseError.ts"
import { MissingConfigurationError } from "#errors/MissingConfigurationError.ts"
import { NostoError } from "#errors/NostoError.ts"
import { NotNostoTemplateError } from "#errors/NotNostoTemplateError.ts"
import { prettyPrintStack, withErrorHandler } from "#errors/withErrorHandler.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const terminal = setupMockConsole()

describe("Error Handler", () => {
  beforeEach(() => {
    terminal.resetMocks()
    clearCachedConfig()
  })
  it("should execute function without error handling if no error occurs", async () => {
    const mockFn = vi.fn()

    await withErrorHandler(mockFn)

    expect(mockFn).toHaveBeenCalled()
    expect(terminal.getSpy("error")).not.toHaveBeenCalled()
  })

  it("should handle NostoError", async () => {
    const mockFn = vi.fn(() => {
      throw new NostoError("Test Nosto error")
    })

    expect(() => withErrorHandler(mockFn)).not.toThrow()
    expect(terminal.getSpy("error")).toHaveBeenCalledWith("- Test Nosto error")
  })

  it("should handle NotNostoTemplateError", async () => {
    const mockFn = vi.fn(() => {
      throw new NotNostoTemplateError("Test Nosto error")
    })

    expect(() => withErrorHandler(mockFn)).not.toThrow()
    expect(terminal.getSpy("error")).toHaveBeenCalledWith("- Test Nosto error")
  })

  it("should handle InvalidLoginResponseError", async () => {
    const mockFn = vi.fn(() => {
      throw new InvalidLoginResponseError("Test Nosto error")
    })

    expect(() => withErrorHandler(mockFn)).not.toThrow()
    expect(terminal.getSpy("error")).toHaveBeenCalledWith(
      "Received malformed login response from server. This is probably a bug on our side.",
      expect.any(InvalidLoginResponseError)
    )
  })

  it("should handle MissingConfigurationError", async () => {
    const mockFn = vi.fn(() => {
      throw new MissingConfigurationError("Test config error")
    })

    expect(() => withErrorHandler(mockFn)).not.toThrow()
    expect(terminal.getSpy("error")).toHaveBeenCalledWith("Test config error")
  })

  it("should handle HTTPError", async () => {
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

    expect(() => withErrorHandler(mockFn)).not.toThrow()
    expect(terminal.getSpy("error")).toHaveBeenCalledWith("- GET https://example.com/api")
  })

  it("should handle HTTPError", async () => {
    const mockFn = vi.fn(() => {
      throw new TimeoutError({
        method: "GET",
        url: "https://example.com/api"
      } as Request)
    })

    expect(() => withErrorHandler(mockFn)).not.toThrow()
    expect(terminal.getSpy("error")).toHaveBeenCalledWith("HTTP Request timed out:")
  })

  it("should print out stack trace", async () => {
    setupMockConfig({ verbose: true })
    const mockFn = vi.fn(() => {
      throw new TimeoutError({
        method: "GET",
        url: "https://example.com/api"
      } as Request)
    })

    await withErrorHandler(mockFn)
    expect(terminal.getSpy("raw")).toHaveBeenCalledWith(expect.stringContaining("withErrorHandler.test.ts:"))
  })

  it("should print out verbosity note", async () => {
    setupMockConfig({ verbose: false, logLevel: "info" })
    terminal.setContext({ logLevel: "info" })
    const mockFn = vi.fn(() => {
      throw new TimeoutError({
        method: "GET",
        url: "https://example.com/api"
      } as Request)
    })

    await withErrorHandler(mockFn)
    expect(terminal.getSpy("raw")).not.toHaveBeenCalledWith(expect.stringContaining("withErrorHandler.test.ts:"))
    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Rerun with --verbose to see details"))
  })

  it("should rethrow unknown errors", async () => {
    const unknownError = new Error("Unknown error")
    const mockFn = vi.fn(() => {
      throw unknownError
    })

    await expect(withErrorHandler(mockFn)).rejects.toThrow("Unknown error")
  })

  it("handles error without stack gracefully", async () => {
    expect(() => prettyPrintStack(undefined)).not.toThrow()
  })
})
