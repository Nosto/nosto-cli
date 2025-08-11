import { describe, it, expect, vi, beforeEach } from "vitest"
import { searchTemplateDevMode } from "../../../src/modules/search-templates/dev.ts"

// Mock dependencies
vi.mock("../../../src/console/logger.ts", () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}))

vi.mock("../../../src/config/config.ts", () => ({
  getCachedConfig: vi.fn(() => ({
    merchant: "test-merchant",
    templatesEnv: "main",
    apiUrl: "https://api.nosto.com"
  }))
}))

vi.mock("../../../src/console/userPrompt.ts", () => ({
  promptForConfirmation: vi.fn()
}))

const mockContext = {
  watch: vi.fn(),
  dispose: vi.fn()
}

vi.mock("../../../src/filesystem/esbuild.ts", () => ({
  getBuildContext: vi.fn(() => Promise.resolve(mockContext))
}))

vi.mock("../../../src/filesystem/plugins.ts", () => ({
  pushOnRebuildPlugin: vi.fn(() => ({ name: "push-on-rebuild" }))
}))

describe("Search Template Dev Mode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("searchTemplateDevMode", () => {
    it("should prompt for confirmation when not skipped", async () => {
      const { promptForConfirmation } = await import("../../../src/console/userPrompt.ts")
      vi.mocked(promptForConfirmation).mockResolvedValue(true)

      await searchTemplateDevMode({ skipConfirmation: false })

      expect(promptForConfirmation).toHaveBeenCalledWith(
        expect.stringContaining("Dev mode will continuously build and upload"),
        "N"
      )
    })

    it("should cancel operation when user declines", async () => {
      const { promptForConfirmation } = await import("../../../src/console/userPrompt.ts")
      const { Logger } = await import("../../../src/console/logger.ts")
      vi.mocked(promptForConfirmation).mockResolvedValue(false)

      await searchTemplateDevMode({ skipConfirmation: false })

      expect(Logger.info).toHaveBeenCalledWith("Operation cancelled by user.")
      expect(mockContext.watch).not.toHaveBeenCalled()
    })

    it("should start watching when confirmed", async () => {
      const { promptForConfirmation } = await import("../../../src/console/userPrompt.ts")
      const { Logger } = await import("../../../src/console/logger.ts")
      const { getBuildContext } = await import("../../../src/filesystem/esbuild.ts")

      vi.mocked(promptForConfirmation).mockResolvedValue(true)

      await searchTemplateDevMode({ skipConfirmation: false })

      expect(getBuildContext).toHaveBeenCalledWith({ plugins: [{ name: "push-on-rebuild" }] })
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Watching for changes"))
      expect(mockContext.watch).toHaveBeenCalled()
    })

    it("should skip confirmation when flag is set", async () => {
      const { promptForConfirmation } = await import("../../../src/console/userPrompt.ts")

      await searchTemplateDevMode({ skipConfirmation: true })

      expect(promptForConfirmation).not.toHaveBeenCalled()
      expect(mockContext.watch).toHaveBeenCalled()
    })

    it("should set up SIGINT handler", async () => {
      const processOnSpy = vi.spyOn(process, "on").mockImplementation(() => process)

      await searchTemplateDevMode({ skipConfirmation: true })

      expect(processOnSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function))

      processOnSpy.mockRestore()
    })
  })
})
