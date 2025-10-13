import { describe, expect, it, vi } from "vitest"

import { OnStartDevProps } from "#config/schema.ts"
import { parseSearchTemplatesConfigFile } from "#config/searchTemplatesConfig.ts"
import { searchTemplateDevMode } from "#modules/search-templates/dev.ts"
import * as pushCommandModule from "#modules/search-templates/push.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockStarterManifest } from "#test/utils/mockStarterManifest.ts"

describe("Search Templates dev mode / modern", () => {
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
