import { beforeEach, describe, expect, it, vi } from "vitest"

import { parseSearchTemplatesConfigFile } from "#config/searchTemplatesConfig.ts"
import { buildSearchTemplate } from "#modules/search-templates/build.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { mockFetchSourceFile, mockPutSourceFile, setupMockServer } from "#test/utils/mockServer.ts"
import { setupMockStarterManifest } from "#test/utils/mockStarterManifest.ts"

const fs = setupMockFileSystem()
const server = setupMockServer()
const terminal = setupMockConsole()

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
      mockScript: {
        onBuild: vi.fn().mockImplementation(async () => {
          // Simulate the build creating output files
          fs.writeFile("build/index.js", "console.log('built')")
        })
      }
    })
    setupMockConfig({
      searchTemplates: await parseSearchTemplatesConfigFile({ projectPath: "." })
    })

    // Create a source file that contains Nosto import (required by push logic)
    fs.writeFile("index.ts", "import { search } from '@nosto/preact'")

    // Mock the API endpoints - the push operation will check for remote hash first
    mockFetchSourceFile(server, {
      path: "build/hash",
      error: { status: 404, message: "Not Found" }
    })

    const indexMock = mockPutSourceFile(server, { path: "build/index.js" })
    const hashMock = mockPutSourceFile(server, { path: "build/hash" })

    // Set force: true to skip the confirmation prompt
    terminal.setUserResponse("y")

    await buildSearchTemplate({ watch: false, push: true })

    expect(manifest.onBuild).toHaveBeenCalled()
    expect(indexMock.invocations).toHaveLength(1)
    expect(hashMock.invocations).toHaveLength(1)
  })

  it("should not push templates when push is false", async () => {
    const manifest = setupMockStarterManifest({
      mockScript: { onBuild: vi.fn() }
    })
    setupMockConfig({
      searchTemplates: await parseSearchTemplatesConfigFile({ projectPath: "." })
    })

    // Create build output files that would be pushed if push was true
    fs.writeFile("build/index.js", "console.log('built')")

    // Mock the API endpoints to track if they're called
    const indexMock = mockPutSourceFile(server, { path: "build/index.js" })

    await buildSearchTemplate({ watch: false, push: false })

    expect(manifest.onBuild).toHaveBeenCalled()
    expect(indexMock.invocations).toHaveLength(0)
  })

  it("should not push templates when push is undefined", async () => {
    const manifest = setupMockStarterManifest({
      mockScript: { onBuild: vi.fn() }
    })
    setupMockConfig({
      searchTemplates: await parseSearchTemplatesConfigFile({ projectPath: "." })
    })

    // Create build output files that would be pushed if push was true
    fs.writeFile("build/index.js", "console.log('built')")

    // Mock the API endpoints to track if they're called
    const indexMock = mockPutSourceFile(server, { path: "build/index.js" })

    await buildSearchTemplate({ watch: false })

    expect(manifest.onBuild).toHaveBeenCalled()
    expect(indexMock.invocations).toHaveLength(0)
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

    // Create build output files that would be pushed if not in watch mode
    fs.writeFile("build/index.js", "console.log('built')")

    // Mock the API endpoints to track if they're called
    const indexMock = mockPutSourceFile(server, { path: "build/index.js" })

    await buildSearchTemplate({ watch: true, push: true })

    expect(manifest.onBuildWatch).toHaveBeenCalled()
    expect(indexMock.invocations).toHaveLength(0)
  })
})
