import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildSearchTemplate } from "#modules/search-templates/build.ts"
import { setupTestServer } from "#test/setup.ts"
import { mockConfig, mockFilesystem } from "#test/utils/mocks.ts"
import { mockConsole } from "#test/utils/consoleMocks.ts"

const fs = mockFilesystem()
const server = setupTestServer()
const terminal = mockConsole()

// Mock the esbuild context
const mockContext = {
  rebuild: vi.fn(),
  dispose: vi.fn(),
  watch: vi.fn()
}

vi.mock("#filesystem/esbuild.ts", () => ({
  getBuildContext: vi.fn(() => Promise.resolve(mockContext))
}))

vi.mock("#filesystem/loadLibrary.ts", () => ({
  loadLibrary: vi.fn()
}))

describe("Build Search Templates", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockConfig({ projectPath: "/test/project" })
  })

  describe("buildSearchTemplate", () => {
    it("should build templates without watch mode", async () => {
      const { loadLibrary } = await import("#filesystem/loadLibrary.ts")

      await buildSearchTemplate({ watch: false })

      expect(loadLibrary).toHaveBeenCalledWith("/test/project/.nostocache/library")
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
  })
})
