import { beforeEach, describe, expect, it, vi } from "vitest"

import { parseSearchTemplatesConfigFile } from "#config/searchTemplatesConfig.ts"
import { buildSearchTemplate } from "#modules/search-templates/build.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockStarterManifest } from "#test/utils/mockStarterManifest.ts"

describe("Search Templates build / modern", () => {
  beforeEach(() => {
    setupMockStarterManifest()
  })
  it("should build templates without watch mode", async () => {
    const manifest = setupMockStarterManifest({
      mockScript: { onBuild: vi.fn() }
    })
    setupMockConfig({
      searchTemplates: await parseSearchTemplatesConfigFile({ projectPath: "." })
    })
    await buildSearchTemplate({ watch: false })
    expect(manifest.onBuild).toHaveBeenCalled()
  })

  it("should build templates with watch mode", async () => {
    const manifest = setupMockStarterManifest({
      mockScript: {
        onBuildWatch: vi.fn().mockImplementation(async ({ onAfterBuild }) => {
          await onAfterBuild()
        })
      }
    })
    setupMockConfig({
      searchTemplates: await parseSearchTemplatesConfigFile({ projectPath: "." })
    })
    await buildSearchTemplate({ watch: true })
    expect(manifest.onBuildWatch).toHaveBeenCalled()
  })
})
