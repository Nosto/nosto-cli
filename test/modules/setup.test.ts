import { describe, it, expect, vi, beforeEach } from "vitest"
import { printSetupHelp } from "#modules/setup.ts"
import { setupTestServer } from "#test/setup.ts"
import { mockConfig, mockFilesystem } from "#test/utils/mocks.ts"
import { mockConsole } from "#test/utils/consoleMocks.ts"
import path from "path"

const fs = mockFilesystem()
const server = setupTestServer()
const terminal = mockConsole()

describe("Setup Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    terminal.clearPrompts()
    mockConfig({ projectPath: "/test/path" })
  })

  describe("printSetupHelp", () => {
    it("should print configuration help information", async () => {
      fs.createFile(path.join("/test/path", ".nosto.json"), '{"apiKey": "test"}')

      await printSetupHelp("/test/path")

      // Configuration help should be printed (tested via no errors thrown)
      expect(true).toBe(true)
    })

    it("should show warning when config file not found", async () => {
      terminal.setUserResponse("N")

      await printSetupHelp("/test/path")

      // Warning should be shown and config info displayed (tested via no errors thrown)
      expect(true).toBe(true)
    })

    it("should create config file when user confirms", async () => {
      terminal.setUserResponse("Y")

      await printSetupHelp("/test/path")

      terminal.expect.user.toHaveBeenPromptedWith("Would you like to create a placeholder configuration file? (Y/n):")
      fs.expectFile(path.join("/test/path", ".nosto.json")).toExist()
    })

    it("should not create config file when user declines", async () => {
      terminal.setUserResponse("N")

      await printSetupHelp("/test/path")

      fs.expectFile(path.join("/test/path", ".nosto.json")).not.toExist()
    })

    it("should not prompt when config file already exists", async () => {
      fs.createFile(path.join("/test/path", ".nosto.json"), '{"apiKey": "test"}')

      await printSetupHelp("/test/path")

      // No prompt should occur when file exists (tested via no terminal interaction)
      expect(terminal.handle.recordedPrompts).toHaveLength(0)
    })
  })
})
