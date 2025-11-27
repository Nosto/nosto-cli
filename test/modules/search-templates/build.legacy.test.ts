import * as esbuild from "esbuild"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { buildSearchTemplate } from "#modules/search-templates/build.ts"
import { pushSearchTemplate } from "#modules/search-templates/push.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { mockFetchLibraryFile, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
const terminal = setupMockConsole()

vi.mock("#modules/search-templates/push.ts", () => ({
  pushSearchTemplate: vi.fn()
}))

vi.mock("esbuild", () => ({
  context: vi.fn()
}))

describe("Search Templates build / legacy", () => {
  const mockContext = {
    rebuild: vi.fn(),
    dispose: vi.fn(),
    watch: vi.fn(),
    serve: vi.fn(),
    cancel: vi.fn()
  }

  beforeEach(() => {
    setupMockConfig({
      apiKey: "test-key",
      merchant: "test-merchant",
      projectPath: "/test-project"
    })

    vi.mocked(esbuild.context).mockResolvedValue(mockContext)

    // Mock library file fetches
    mockFetchLibraryFile(server, {
      path: "nosto.module.js",
      response: "// nosto.module.js content"
    })
    mockFetchLibraryFile(server, {
      path: "nosto.module.js.map",
      response: "// nosto.module.js.map content"
    })
    mockFetchLibraryFile(server, {
      path: "nosto.d.ts",
      response: "// nosto.d.ts content"
    })
  })

  describe("buildSearchTemplate", () => {
    it("should build templates without watch mode", async () => {
      await buildSearchTemplate({ watch: false })

      expect(mockContext.rebuild).toHaveBeenCalled()
      expect(mockContext.dispose).toHaveBeenCalled()
      expect(mockContext.watch).not.toHaveBeenCalled()
    })

    it("should build templates with watch mode", async () => {
      await buildSearchTemplate({ watch: true })

      expect(mockContext.watch).toHaveBeenCalled()
      expect(mockContext.rebuild).not.toHaveBeenCalled()
      expect(mockContext.dispose).not.toHaveBeenCalled()
    })

    it("should set up SIGINT handler in watch mode", async () => {
      const processOnSpy = vi.spyOn(process, "on").mockImplementation(() => process)

      await buildSearchTemplate({ watch: true })

      expect(processOnSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function))

      processOnSpy.mockRestore()
    })

    it("should handle SIGINT signal correctly", async () => {
      const processOnSpy = vi.spyOn(process, "on").mockImplementation(() => process)
      const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never)

      await buildSearchTemplate({ watch: true })

      // Get the SIGINT handler that was registered
      const sigintCall = processOnSpy.mock.calls.find(call => call[0] === "SIGINT")
      const sigintHandler = sigintCall?.[1] as () => void
      expect(sigintHandler).toBeDefined()

      // Simulate SIGINT signal
      sigintHandler()

      // Verify the handler behavior
      expect(mockContext.dispose).toHaveBeenCalled()
      expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Watch mode stopped."))
      expect(processExitSpy).toHaveBeenCalledWith(0)

      processOnSpy.mockRestore()
      processExitSpy.mockRestore()
    })

    it("should push templates after build when push is true", async () => {
      await buildSearchTemplate({ watch: false, push: true })

      expect(mockContext.rebuild).toHaveBeenCalled()
      expect(mockContext.dispose).toHaveBeenCalled()
      expect(vi.mocked(pushSearchTemplate)).toHaveBeenCalledWith({
        paths: ["build"],
        force: false
      })
    })

    it("should not push templates when push is false", async () => {
      await buildSearchTemplate({ watch: false, push: false })

      expect(mockContext.rebuild).toHaveBeenCalled()
      expect(mockContext.dispose).toHaveBeenCalled()
      expect(vi.mocked(pushSearchTemplate)).not.toHaveBeenCalled()
    })

    it("should not push templates when push is undefined", async () => {
      await buildSearchTemplate({ watch: false })

      expect(mockContext.rebuild).toHaveBeenCalled()
      expect(mockContext.dispose).toHaveBeenCalled()
      expect(vi.mocked(pushSearchTemplate)).not.toHaveBeenCalled()
    })

    it("should not push templates in watch mode even if push is true", async () => {
      await buildSearchTemplate({ watch: true, push: true })

      expect(mockContext.watch).toHaveBeenCalled()
      expect(vi.mocked(pushSearchTemplate)).not.toHaveBeenCalled()
    })
  })
})
