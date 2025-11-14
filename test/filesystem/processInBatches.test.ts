import { describe, expect, it } from "vitest"

import { processInBatches } from "#filesystem/processInBatches.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const terminal = setupMockConsole()

describe("processInBatches", () => {
  it("handles thrown errors gracefully", async () => {
    await processInBatches({
      files: ["first.js"],
      logIcon: "",
      processElement: async () => {
        throw new Error("Test error")
      }
    })

    expect(terminal.getSpy("error")).toHaveBeenCalledWith(expect.stringContaining("✗ first.js: Test error"))
    expect(terminal.getSpy("warn")).toHaveBeenCalledWith(expect.stringContaining("Batch completed with 1 failures"))
  })

  it("handles thrown ducks gracefully", async () => {
    await processInBatches({
      files: ["first.js"],
      logIcon: "",
      processElement: async () => {
        throw "a duck"
      }
    })

    expect(terminal.getSpy("error")).toHaveBeenCalledWith(expect.stringContaining("✗ first.js: a duck"))
    expect(terminal.getSpy("warn")).toHaveBeenCalledWith(expect.stringContaining("Batch completed with 1 failures"))
  })
})
