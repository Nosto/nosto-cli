import { describe, expect, it, vi } from "vitest"

import * as config from "#config/config.ts"
import { printStatus } from "#modules/status.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const terminal = setupMockConsole()

describe("Status Module", () => {
  it("should print configuration status by default", async () => {
    await expect(printStatus(".")).resolves.not.toThrow()
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Configuration is not valid:")
  })

  it("should indicate valid configuration for api key", async () => {
    setupMockConfig({ merchant: "test-merchant", apiKey: "test-key" })

    await expect(printStatus(".")).resolves.not.toThrow()
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Configuration seems to be valid:")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Using API key for authentication"))
  })

  it("should indicate valid configuration for user auth", async () => {
    setupMockConfig({
      merchant: "test-merchant",
      apiKey: "",
      auth: { user: "test", token: "test", expiresAt: new Date(Date.now() + 3600 * 1000) }
    })

    await expect(printStatus(".")).resolves.not.toThrow()
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Configuration seems to be valid:")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith(
      expect.stringContaining("Using user account for authentication")
    )
  })

  it("should indicate invalid user auth", async () => {
    setupMockConfig({ merchant: "test-merchant", apiKey: "", auth: { user: "", token: "", expiresAt: new Date(0) } })

    await expect(printStatus(".")).resolves.not.toThrow()
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Configuration is not valid:")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Missing authentication"))
  })

  it("should indicate expired user auth", async () => {
    setupMockConfig({
      merchant: "test-merchant",
      apiKey: "",
      auth: { user: "test", token: "test", expiresAt: new Date(1) }
    })

    await expect(printStatus(".")).resolves.not.toThrow()
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Configuration is not valid:")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Authentication token expired"))
  })

  it("should rethrow unknown errors in config loading", async () => {
    vi.spyOn(config, "loadConfig").mockRejectedValueOnce(new Error("Unknown error"))

    await expect(printStatus(".")).rejects.toThrow(/Unknown error/)
  })
})
