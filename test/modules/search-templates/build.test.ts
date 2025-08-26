import * as esbuild from "esbuild"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { buildSearchTemplate } from "#modules/search-templates/build.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { mockFetchLibraryFile, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()

vi.mock("esbuild", () => ({
  context: vi.fn()
}))

describe("Build Search Templates", () => {
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
  })
})
