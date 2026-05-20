import { describe, expect, it, vi } from "vitest"

import { pushSearchTemplate } from "#modules/search-templates/push.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { mockPutSourceFile, setupMockServer } from "#test/utils/mockServer.ts"
import { setupMockStarterManifest } from "#test/utils/mockStarterManifest.ts"

const fs = setupMockFileSystem()
const server = setupMockServer()
const terminal = setupMockConsole()

describe("Push Search Templates / Modern", () => {
  it("should only push built artifacts if paths are not provided", async () => {
    setupMockStarterManifest({ mockScript: { onBuild: vi.fn() } })
    fs.writeFile("index.js", "source content")
    fs.writeFile("build/hash", "some-hash")
    fs.writeFile("build/index.js", "built content")

    mockPutSourceFile(server, { path: "build/index.js" })

    terminal.setUserResponse("y")

    await pushSearchTemplate({})

    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Found 2 files to push (0 source, 2 built, 2 ignored).")
  })

  it("should respect paths regardless of pushSources", async () => {
    setupMockStarterManifest({ mockScript: { onBuild: vi.fn() } })
    fs.writeFile("source.js", "source content")
    fs.writeFile("build/hash", "some-hash")
    fs.writeFile("build/index.js", "built content")

    mockPutSourceFile(server, { path: "source.js" })

    terminal.setUserResponse("y")

    await pushSearchTemplate({ paths: ["source.js"] })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Found 2 files to push (1 source, 1 built, 2 ignored).")
  })

  it("should push sources by default if pushSources is true", async () => {
    setupMockStarterManifest({ mockScript: { onBuild: vi.fn() } })
    fs.writeFile("index.js", "source content")
    fs.writeFile("build/hash", "some-hash")
    fs.writeFile("build/index.js", "built content")

    mockPutSourceFile(server, { path: "index.js" })
    mockPutSourceFile(server, { path: "build/index.js" })
    mockPutSourceFile(server, { path: "nosto.config.ts" })

    terminal.setUserResponse("y")

    await pushSearchTemplate({ pushSources: true })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Found 4 files to push (2 source, 2 built, 0 ignored).")
  })
})
