import { beforeEach, describe, expect, it, vi } from "vitest"

import { OnStartDevProps } from "#config/schema.ts"
import { parseSearchTemplatesConfigFile } from "#config/searchTemplatesConfig.ts"
import * as esbuild from "#filesystem/esbuild.ts"
import { searchTemplateDevMode } from "#modules/search-templates/dev.ts"
import * as pushCommandModule from "#modules/search-templates/push.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { mockFetchLibraryFile, setupMockServer } from "#test/utils/mockServer.ts"
import { setupMockStarterManifest } from "#test/utils/mockStarterManifest.ts"

const fs = setupMockFileSystem()
const server = setupMockServer()
const mockConsole = setupMockConsole()

describe("Search Template Dev Mode", () => {
  describe("Modern mode", () => {
    it("should build templates with watch mode", async () => {
      const manifest = setupMockStarterManifest({
        mockScript: {
          onBuildWatch: vi.fn()
        }
      })
      setupMockConfig({
        searchTemplates: await parseSearchTemplatesConfigFile({ projectPath: "." })
      })

      await searchTemplateDevMode()
      expect(manifest.onBuildWatch).toHaveBeenCalled()
    })

    it("runs the callback after build", async () => {
      const manifest = setupMockStarterManifest({
        mockScript: {
          onBuildWatch: vi.fn().mockImplementation(async (args: OnStartDevProps) => {
            args.onAfterBuild()
          })
        }
      })
      setupMockConfig({
        searchTemplates: await parseSearchTemplatesConfigFile({ projectPath: "." })
      })

      vi.spyOn(pushCommandModule, "pushSearchTemplate").mockImplementation(vi.fn())

      await searchTemplateDevMode()

      expect(manifest.onBuildWatch).toHaveBeenCalled()
      expect(pushCommandModule.pushSearchTemplate).toHaveBeenCalledWith({ paths: ["build"], force: false })
    })
  })
  describe("Legacy mode", () => {
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

    it("should have pulled the library", async () => {
      await searchTemplateDevMode()

      fs.expectFile(".nostocache/library/nosto.module.js").toContain('"// nosto.module.js content"')
      fs.expectFile(".nostocache/library/nosto.module.js.map").toContain('"// nosto.module.js.map content"')
      fs.expectFile(".nostocache/library/nosto.d.ts").toContain('"// nosto.d.ts content"')
    })
  })
})
