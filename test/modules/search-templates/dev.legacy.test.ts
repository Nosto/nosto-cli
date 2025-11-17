import { beforeEach, describe, expect, it, vi } from "vitest"

import * as esbuild from "#filesystem/esbuild.ts"
import { searchTemplateDevMode } from "#modules/search-templates/dev.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { mockFetchLibraryFile, setupMockServer } from "#test/utils/mockServer.ts"

const fs = setupMockFileSystem()
const server = setupMockServer()
const mockConsole = setupMockConsole()

describe("Search Templates dev mode / legacy", () => {
  const mockContext = {
    watch: vi.fn(),
    dispose: vi.fn()
  }

  beforeEach(() => {
    vi.spyOn(esbuild, "getBuildContext").mockReturnValue(
      mockContext as unknown as ReturnType<typeof esbuild.getBuildContext>
    )

    setupMockConfig({
      libraryUrl: "https://library.nosto.com"
    })
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

  it("should start watching when confirmed", async () => {
    const getBuildContext = vi.spyOn(esbuild, "getBuildContext")

    await searchTemplateDevMode()

    expect(getBuildContext).toHaveBeenCalledWith({ plugins: [expect.objectContaining({ name: "push-on-rebuild" })] })
    expect(mockContext.watch).toHaveBeenCalled()
  })

  it("should skip confirmation when flag is set", async () => {
    await searchTemplateDevMode()

    mockConsole.expect.user.not.toHaveBeenPrompted()
    expect(mockContext.watch).toHaveBeenCalled()
  })

  it("should set up SIGINT handler", async () => {
    const processOnSpy = vi.spyOn(process, "on").mockImplementation(() => process)

    await searchTemplateDevMode()

    expect(processOnSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function))

    processOnSpy.mockRestore()
  })

  it("should handle SIGINT signal correctly", async () => {
    const processOnSpy = vi.spyOn(process, "on").mockImplementation(() => process)
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never)

    await searchTemplateDevMode()

    // Get the SIGINT handler that was registered
    const sigintCall = processOnSpy.mock.calls.find(call => call[0] === "SIGINT")
    const sigintHandler = sigintCall?.[1] as () => void
    expect(sigintHandler).toBeDefined()

    // Simulate SIGINT signal
    sigintHandler()

    // Verify the handler behavior
    expect(mockContext.dispose).toHaveBeenCalled()
    expect(mockConsole.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Watch mode stopped."))
    expect(processExitSpy).toHaveBeenCalledWith(0)

    processOnSpy.mockRestore()
    processExitSpy.mockRestore()
  })

  it("should have pulled the library", async () => {
    await searchTemplateDevMode()

    fs.expectFile(".nostocache/library/nosto.module.js").toContain('"// nosto.module.js content"')
    fs.expectFile(".nostocache/library/nosto.module.js.map").toContain('"// nosto.module.js.map content"')
    fs.expectFile(".nostocache/library/nosto.d.ts").toContain('"// nosto.d.ts content"')
  })
})
