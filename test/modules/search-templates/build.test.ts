import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildSearchTemplate } from "#modules/search-templates/build.ts"
import * as esbuild from "#filesystem/esbuild.ts"
import { setupMockServer, mockFetchLibraryFile } from "#test/utils/mockServer.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"

const server = setupMockServer()

describe("Build Search Templates", () => {
  const mockContext = {
    rebuild: vi.fn(),
    dispose: vi.fn(),
    watch: vi.fn()
  }

  beforeEach(() => {
    setupMockConfig({
      apiKey: "test-key",
      merchant: "test-merchant",
      projectPath: "/test-project"
    })

    vi.spyOn(esbuild, "getBuildContext").mockReturnValue(
      mockContext as unknown as ReturnType<typeof esbuild.getBuildContext>
    )

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
  })
})
