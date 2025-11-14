import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { clearCachedConfig, getCachedConfig, getCachedSearchTemplatesConfig, loadConfig } from "#config/config.ts"
import { PersistentConfigSchema } from "#config/schema.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()
const terminal = setupMockConsole()

describe("Config", () => {
  beforeEach(() => {
    clearCachedConfig()
  })

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NOSTO_MAX_REQUESTS
    vi.restoreAllMocks()
  })

  it("uses cached config on subsequent calls", async () => {
    fs.mockConfigFile()
    fs.mockUserAuthentication()

    await loadConfig({ projectPath: ".", options: {} })
    expect(terminal.getSpy("debug")).not.toHaveBeenCalledWith("Using cached configuration")
    await loadConfig({ projectPath: ".", options: {} })
    expect(terminal.getSpy("debug")).toHaveBeenCalledWith("Using cached configuration")
  })

  it("returns cached config", async () => {
    fs.mockConfigFile()
    fs.mockUserAuthentication()

    const config = await loadConfig({ projectPath: ".", options: {} })
    expect(getCachedConfig()).toEqual(config)
  })

  it("returns cached search-templates build config", async () => {
    fs.mockConfigFile()
    fs.mockUserAuthentication()

    const config = await loadConfig({ projectPath: ".", options: {} })
    expect(getCachedSearchTemplatesConfig()).toEqual(config.searchTemplates.data)
  })

  it("throws error with cause when last-chance schema validation fails", async () => {
    fs.mockUserAuthentication()
    fs.mockConfigFile()

    // Mock the PersistentConfigSchema.parse to throw an error
    const mockParse = vi.spyOn(PersistentConfigSchema, "parse")
    mockParse.mockImplementationOnce(() => {
      throw new Error("Mocked schema validation error")
    })

    await expect(loadConfig({ projectPath: ".", options: {} })).rejects.toThrow("Failed to load configuration")
  })

  it("default implementation of modern config should throw", async () => {
    fs.mockUserAuthentication()
    fs.mockConfigFile()

    const config = await loadConfig({ projectPath: ".", options: {} })
    await expect(config.searchTemplates.data.onBuild()).rejects.toThrow(/not implemented/)
    await expect(config.searchTemplates.data.onBuildWatch({ onAfterBuild: async () => {} })).rejects.toThrow(
      /not implemented/
    )
  })
})
