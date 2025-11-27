import { beforeEach, describe, expect, it, vi } from "vitest"

import { parseSearchTemplatesConfigFile } from "#config/searchTemplatesConfig.ts"
import { buildSearchTemplate } from "#modules/search-templates/build.ts"
import { pushSearchTemplate } from "#modules/search-templates/push.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockStarterManifest } from "#test/utils/mockStarterManifest.ts"

vi.mock("#modules/search-templates/push.ts", () => ({
  pushSearchTemplate: vi.fn()
}))

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

  it("should push templates after build when push is true", async () => {
    const manifest = setupMockStarterManifest({
      mockScript: { onBuild: vi.fn() }
    })
    setupMockConfig({
      searchTemplates: await parseSearchTemplatesConfigFile({ projectPath: "." })
    })
    await buildSearchTemplate({ watch: false, push: true })
    expect(manifest.onBuild).toHaveBeenCalled()
    expect(vi.mocked(pushSearchTemplate)).toHaveBeenCalledWith({
      paths: ["build"],
      force: false
    })
  })

  it("should not push templates when push is false", async () => {
    const manifest = setupMockStarterManifest({
      mockScript: { onBuild: vi.fn() }
    })
    setupMockConfig({
      searchTemplates: await parseSearchTemplatesConfigFile({ projectPath: "." })
    })
    await buildSearchTemplate({ watch: false, push: false })
    expect(manifest.onBuild).toHaveBeenCalled()
    expect(vi.mocked(pushSearchTemplate)).not.toHaveBeenCalled()
  })

  it("should not push templates when push is undefined", async () => {
    const manifest = setupMockStarterManifest({
      mockScript: { onBuild: vi.fn() }
    })
    setupMockConfig({
      searchTemplates: await parseSearchTemplatesConfigFile({ projectPath: "." })
    })
    await buildSearchTemplate({ watch: false })
    expect(manifest.onBuild).toHaveBeenCalled()
    expect(vi.mocked(pushSearchTemplate)).not.toHaveBeenCalled()
  })

  it("should not push templates in watch mode even if push is true", async () => {
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
    await buildSearchTemplate({ watch: true, push: true })
    expect(manifest.onBuildWatch).toHaveBeenCalled()
    expect(vi.mocked(pushSearchTemplate)).not.toHaveBeenCalled()
  })
})
