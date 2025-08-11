import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildSearchTemplate } from "../../../src/modules/search-templates/build.ts"

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
    projectPath: "/test/project"
  }))
}))

vi.mock("../../../src/filesystem/loadLibrary.ts", () => ({
  loadLibrary: vi.fn()
}))

const mockContext = {
  rebuild: vi.fn(),
  dispose: vi.fn(),
  watch: vi.fn()
}

vi.mock("../../../src/filesystem/esbuild.ts", () => ({
  getBuildContext: vi.fn(() => Promise.resolve(mockContext))
}))

describe("Build Search Templates", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("buildSearchTemplate", () => {
    it("should build templates without watch mode", async () => {
      const { Logger } = await import("../../../src/console/logger.ts")
      const { loadLibrary } = await import("../../../src/filesystem/loadLibrary.ts")

      await buildSearchTemplate({ watch: false })

      expect(loadLibrary).toHaveBeenCalledWith("/test/project/.nostocache/library")
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Fetching library to:"))
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Building templates to:"))
      expect(mockContext.rebuild).toHaveBeenCalled()
      expect(mockContext.dispose).toHaveBeenCalled()
      expect(mockContext.watch).not.toHaveBeenCalled()
    })

    it("should build templates with watch mode", async () => {
      const { Logger } = await import("../../../src/console/logger.ts")

      await buildSearchTemplate({ watch: true })

      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Watching for changes"))
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
