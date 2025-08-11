import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { fetchWithRetry } from "../../src/api/retry.ts"
import { Logger } from "../../src/console/logger.ts"

describe("API Retry", () => {
  let loggerErrorSpy: ReturnType<typeof vi.spyOn>
  let loggerWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    loggerErrorSpy = vi.spyOn(Logger, "error").mockImplementation(() => {})
    loggerWarnSpy = vi.spyOn(Logger, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    loggerErrorSpy.mockRestore()
    loggerWarnSpy.mockRestore()
  })

  describe("fetchWithRetry", () => {
    it("should return result on first successful attempt", async () => {
      const mockApiFunction = vi.fn().mockResolvedValue("success")

      const result = await fetchWithRetry(mockApiFunction, "test-file.txt")

      expect(result).toBe("success")
      expect(mockApiFunction).toHaveBeenCalledTimes(1)
      expect(mockApiFunction).toHaveBeenCalledWith("test-file.txt")
    })

    it("should retry on failure and eventually succeed", async () => {
      const mockApiFunction = vi
        .fn()
        .mockRejectedValueOnce(new Error("First failure"))
        .mockRejectedValueOnce(new Error("Second failure"))
        .mockResolvedValue("success")

      const retryPromise = fetchWithRetry(mockApiFunction, "test-file.txt")

      // Fast forward through the retry delays
      await vi.runAllTimersAsync()

      const result = await retryPromise

      expect(result).toBe("success")
      expect(mockApiFunction).toHaveBeenCalledTimes(3)
    })

    it("should throw error after max retries exceeded", async () => {
      const mockApiFunction = vi.fn().mockRejectedValue(new Error("Persistent failure"))

      const retryPromise = fetchWithRetry(mockApiFunction, "test-file.txt")

      // Fast forward through all retry delays
      await vi.runAllTimersAsync()

      await expect(retryPromise).rejects.toThrow("Failed to fetch test-file.txt after 3 retries: Persistent failure")
      expect(mockApiFunction).toHaveBeenCalledTimes(4) // Initial + 3 retries
    })

    it("should log warnings during retries", async () => {
      const mockApiFunction = vi.fn().mockRejectedValueOnce(new Error("Temporary failure")).mockResolvedValue("success")

      const retryPromise = fetchWithRetry(mockApiFunction, "test-file.txt")

      // Fast forward through the retry delay
      await vi.runAllTimersAsync()

      await retryPromise

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch test-file.txt: Retrying in 1000ms (attempt 1/3)")
      )
    })

    it("should log error on final failure", async () => {
      const mockApiFunction = vi.fn().mockRejectedValue(new Error("Final error"))

      const retryPromise = fetchWithRetry(mockApiFunction, "test-file.txt")

      // Fast forward through all retry delays
      await vi.runAllTimersAsync()

      await expect(retryPromise).rejects.toThrow()

      expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining("test-file.txt: Final error"))
    })

    it("should handle non-Error objects", async () => {
      const mockApiFunction = vi.fn().mockRejectedValue("String error")

      const retryPromise = fetchWithRetry(mockApiFunction, "test-file.txt")

      await vi.runAllTimersAsync()

      await expect(retryPromise).rejects.toThrow("Failed to fetch test-file.txt after 3 retries: String error")
    })
  })
})
