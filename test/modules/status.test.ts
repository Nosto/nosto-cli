import { describe, expect, it } from "vitest"

import { printStatus } from "#modules/status.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const terminal = setupMockConsole()

describe("Status Module", () => {
  it("should print configuration status by default", async () => {
    await expect(printStatus(".")).resolves.not.toThrow()
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Configuration is not valid:")
  })

  it("should indicate valid configuration", async () => {
    setupMockConfig({ merchant: "test-merchant" })

    await expect(printStatus(".")).resolves.not.toThrow()
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Configuration seems to be valid:")
    expect(terminal.getSpy("error")).toHaveBeenCalledWith("Some required configuration is missing\n")
  })
})
