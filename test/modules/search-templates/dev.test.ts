import { describe, it, expect, vi, beforeEach } from "vitest"
import { searchTemplateDevMode } from "#modules/search-templates/dev.ts"
import { setupTestServer } from "#test/setup.ts"
import { mockConfig, mockFilesystem } from "#test/utils/mocks.ts"
import { mockConsole } from "#test/utils/consoleMocks.ts"

const fs = mockFilesystem()
const server = setupTestServer()
const terminal = mockConsole()

// Mock the esbuild context
const mockContext = {
  watch: vi.fn(),
  dispose: vi.fn()
}

vi.mock("#filesystem/esbuild.ts", () => ({
  getBuildContext: vi.fn(() => Promise.resolve(mockContext))
}))

vi.mock("#filesystem/plugins.ts", () => ({
  pushOnRebuildPlugin: vi.fn(() => ({ name: "push-on-rebuild" }))
}))

describe("Search Template Dev Mode", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    terminal.clearPrompts()
    mockConfig({
      merchant: "test-merchant",
      templatesEnv: "main",
      apiUrl: "https://api.nosto.com"
    })
  })

  describe("searchTemplateDevMode", () => {
    it("should prompt for confirmation when not skipped", async () => {
      terminal.setUserResponse("Y")

      await searchTemplateDevMode({ skipConfirmation: false })

      terminal.expect.user.toHaveBeenPromptedWith("Dev mode will continuously build and upload files to merchant test-merchant's main environment at https://api.nosto.com.\nContinue? (y/N):")
    })

    it("should cancel operation when user declines", async () => {
      terminal.setUserResponse("N")

      await searchTemplateDevMode({ skipConfirmation: false })

      expect(mockContext.watch).not.toHaveBeenCalled()
    })

    it("should start watching when confirmed", async () => {
      const { getBuildContext } = await import("#filesystem/esbuild.ts")

      terminal.setUserResponse("Y")

      await searchTemplateDevMode({ skipConfirmation: false })

      expect(getBuildContext).toHaveBeenCalledWith({ plugins: [{ name: "push-on-rebuild" }] })
      expect(mockContext.watch).toHaveBeenCalled()
    })

    it("should skip confirmation when flag is set", async () => {
      await searchTemplateDevMode({ skipConfirmation: true })

      expect(terminal.handle.recordedPrompts).toHaveLength(0)
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
