import { describe, it, expect, vi, beforeEach } from "vitest"
import { printSetupHelp } from "../../src/modules/setup.ts"
import fs from "fs"
import path from "path"

// Mock dependencies
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn()
  }
}))

vi.mock("../../src/console/logger.ts", () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}))

vi.mock("../../src/console/userPrompt.ts", () => ({
  promptForConfirmation: vi.fn()
}))

vi.mock("../../src/filesystem/filesystem.ts", () => ({
  writeFile: vi.fn()
}))

describe("Setup Module", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("printSetupHelp", () => {
    it("should print configuration help information", async () => {
      const { Logger } = await import("../../src/console/logger.ts")
      vi.mocked(fs.existsSync).mockReturnValue(true)

      await printSetupHelp("/test/path")

      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Configuration Methods:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Required Parameters:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("API Key:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Merchant ID:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Optional Parameters:"))
    })

    it("should show warning when config file not found", async () => {
      const { Logger } = await import("../../src/console/logger.ts")
      const { promptForConfirmation } = await import("../../src/console/userPrompt.ts")
      vi.mocked(fs.existsSync).mockReturnValue(false)
      vi.mocked(promptForConfirmation).mockResolvedValue(false)

      await printSetupHelp("/test/path")

      expect(Logger.warn).toHaveBeenCalledWith("Configuration file not found in project directory.")
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Placeholder config:"))
    })

    it("should create config file when user confirms", async () => {
      const { promptForConfirmation } = await import("../../src/console/userPrompt.ts")
      const { writeFile } = await import("../../src/filesystem/filesystem.ts")
      const { Logger } = await import("../../src/console/logger.ts")

      vi.mocked(fs.existsSync).mockReturnValue(false)
      vi.mocked(promptForConfirmation).mockResolvedValue(true)

      await printSetupHelp("/test/path")

      expect(promptForConfirmation).toHaveBeenCalledWith(
        "Would you like to create a placeholder configuration file?",
        "Y"
      )
      expect(writeFile).toHaveBeenCalledWith(
        path.join("/test/path", ".nosto.json"),
        expect.stringContaining('"apiKey"')
      )
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Created configuration file"))
    })

    it("should not create config file when user declines", async () => {
      const { promptForConfirmation } = await import("../../src/console/userPrompt.ts")
      const { writeFile } = await import("../../src/filesystem/filesystem.ts")

      vi.mocked(fs.existsSync).mockReturnValue(false)
      vi.mocked(promptForConfirmation).mockResolvedValue(false)

      await printSetupHelp("/test/path")

      expect(writeFile).not.toHaveBeenCalled()
    })

    it("should not prompt when config file already exists", async () => {
      const { promptForConfirmation } = await import("../../src/console/userPrompt.ts")

      vi.mocked(fs.existsSync).mockReturnValue(true)

      await printSetupHelp("/test/path")

      expect(promptForConfirmation).not.toHaveBeenCalled()
    })
  })
})
