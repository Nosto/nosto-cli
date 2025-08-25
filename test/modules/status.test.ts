import { describe, expect, it } from "vitest"

import { printStatus } from "#modules/status.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()
const terminal = setupMockConsole()

describe("Status Module", () => {
  it("should print configuration status by default", async () => {
    expect(() => printStatus(".")).not.toThrow()
    expect(terminal.getSpy("warn")).toHaveBeenCalledWith(
      "Configuration file not found at: .nosto.json. Will try to use environment variables."
    )
  })

  it("should indicate valid configuration", async () => {
    fs.writeFile(".nosto.json", '{"apiKey": "test"}')

    expect(() => printStatus(".")).not.toThrow()
    expect(terminal.getSpy("warn")).not.toHaveBeenCalledWith(
      "Configuration file not found at: .nosto.json. Will try to use environment variables."
    )
    expect(terminal.getSpy("error")).toHaveBeenCalledWith("Some required configuration is missing\n")
  })
})
