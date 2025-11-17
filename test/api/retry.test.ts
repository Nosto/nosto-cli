import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { fetchWithRetry, putWithRetry } from "#api/retry.ts"
import * as putSourceFileModule from "#api/source/putSourceFile.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const terminal = setupMockConsole()

describe("API Retry", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
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
      const assertion = expect(retryPromise).rejects.toThrow(
        "Failed to fetch test-file.txt after 3 retries: Persistent failure"
      )
      await vi.runAllTimersAsync()

      await assertion

      expect(mockApiFunction).toHaveBeenCalledTimes(4) // Initial + 3 retries
    })

    it("should log warnings during retries", async () => {
      const mockApiFunction = vi.fn().mockRejectedValueOnce(new Error("Temporary failure")).mockResolvedValue("success")

      const retryPromise = fetchWithRetry(mockApiFunction, "test-file.txt")

      // Fast forward through the retry delay
      await vi.runAllTimersAsync()

      await retryPromise

      expect(terminal.getSpy("warn")).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch test-file.txt: Retrying in 1000ms (attempt 1/3)")
      )
    })

    it("should log error on final failure", async () => {
      const mockApiFunction = vi.fn().mockRejectedValue(new Error("Final error"))

      const retryPromise = fetchWithRetry(mockApiFunction, "test-file.txt")

      const assertion = expect(retryPromise).rejects.toThrow()
      await vi.runAllTimersAsync()

      await assertion

      expect(terminal.getSpy("error")).toHaveBeenCalledWith(expect.stringContaining("test-file.txt: Final error"))
    })

    it("should handle non-Error objects", async () => {
      const mockApiFunction = vi.fn().mockRejectedValue("String error")

      const retryPromise = fetchWithRetry(mockApiFunction, "test-file.txt")

      const assertion = expect(retryPromise).rejects.toThrow(
        "Failed to fetch test-file.txt after 3 retries: String error"
      )
      await vi.runAllTimersAsync()
      await assertion
    })
  })

  describe("putWithRetry", () => {
    let putSourceFileSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      vi.clearAllMocks()
      putSourceFileSpy = vi.spyOn(putSourceFileModule, "putSourceFile")
    })

    afterEach(() => {
      putSourceFileSpy.mockRestore()
    })

    it("should complete successfully on first attempt", async () => {
      putSourceFileSpy.mockResolvedValue(undefined)

      await putWithRetry("test-file.txt", "content")

      expect(putSourceFileSpy).toHaveBeenCalledTimes(1)
      expect(putSourceFileSpy).toHaveBeenCalledWith("test-file.txt", "content")
    })

    it("should use 'push' operation type in error messages", async () => {
      putSourceFileSpy.mockRejectedValue(new Error("Network error"))

      const retryPromise = putWithRetry("test-file.txt", "content")

      const assertion = expect(retryPromise).rejects.toThrow(
        "Failed to push test-file.txt after 3 retries: Network error"
      )
      await vi.runAllTimersAsync()

      await assertion

      expect(terminal.getSpy("warn")).toHaveBeenCalledWith(
        expect.stringContaining("Failed to push test-file.txt: Retrying in 1000ms (attempt 1/3)")
      )
    })
  })
})
