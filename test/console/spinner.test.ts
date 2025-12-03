import ora from "ora"
import { describe, expect, it, vi } from "vitest"

import { withSpinner } from "#console/spinner.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const terminal = setupMockConsole()

describe("withSpinner", () => {
  it("should start spinner, execute operation, and succeed", async () => {
    const operation = vi.fn().mockResolvedValue("success")

    const result = await withSpinner("Loading...", operation)

    expect(ora).toHaveBeenCalledWith("Loading...")
    expect(terminal.getSpinnerSpy("start")).toHaveBeenCalled()
    expect(operation).toHaveBeenCalled()
    expect(terminal.getSpinnerSpy("succeed")).toHaveBeenCalled()
    expect(terminal.getSpinnerSpy("fail")).not.toHaveBeenCalled()
    expect(result).toBe("success")
  })

  it("should start spinner, handle error, and fail", async () => {
    const error = new Error("API failed")
    const operation = vi.fn().mockRejectedValue(error)

    await expect(withSpinner("Loading...", operation)).rejects.toThrow("API failed")

    expect(ora).toHaveBeenCalledWith("Loading...")
    expect(terminal.getSpinnerSpy("start")).toHaveBeenCalled()
    expect(operation).toHaveBeenCalled()
    expect(terminal.getSpinnerSpy("fail")).toHaveBeenCalled()
    expect(terminal.getSpinnerSpy("succeed")).not.toHaveBeenCalled()
  })

  it("should return the operation result", async () => {
    const expectedData = { id: 1, name: "test" }
    const operation = vi.fn().mockResolvedValue(expectedData)

    const result = await withSpinner("Fetching data...", operation)

    expect(result).toEqual(expectedData)
  })

  it("should handle synchronous errors", async () => {
    const operation = vi.fn().mockImplementation(() => {
      throw new Error("Sync error")
    })

    await expect(withSpinner("Loading...", operation)).rejects.toThrow("Sync error")

    expect(terminal.getSpinnerSpy("fail")).toHaveBeenCalled()
    expect(terminal.getSpinnerSpy("succeed")).not.toHaveBeenCalled()
  })
})
