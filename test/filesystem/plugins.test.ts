import { PluginBuild } from "esbuild"
import { describe, expect, it, vi } from "vitest"

import { createLoaderPlugin, notifyOnRebuildPlugin, pushOnRebuildPlugin } from "#filesystem/esbuildPlugins.ts"
import * as push from "#modules/search-templates/push.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()
const terminal = setupMockConsole()

describe("createLoaderPlugin", () => {
  it("creates loader after successful build", () => {
    const plugin = createLoaderPlugin()
    fs.writeFolder("build")

    plugin.setup({
      onEnd(callback: (result: { errors: unknown[] }) => void) {
        callback({ errors: [] })
      }
    } as PluginBuild)

    fs.expectFile("build/loader.js").toExist()
  })

  it("exits early on errors", () => {
    const plugin = createLoaderPlugin()
    fs.writeFolder("build")

    plugin.setup({
      onEnd(callback: (result: { errors: unknown[] }) => void) {
        callback({ errors: [new Error("Test error")] })
      }
    } as PluginBuild)

    fs.expectFile("build/loader.js").not.toExist()
  })
})

describe("notifyOnRebuildPlugin", () => {
  it("logs build duration after successful build", () => {
    const plugin = notifyOnRebuildPlugin()
    plugin.setup({
      onStart: callback => {
        callback()
      },
      onEnd(callback: (result: { errors: unknown[] }) => void) {
        callback({ errors: [] })
      }
    } as PluginBuild)

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringMatching(/Templates built in \d+ ms\./))
  })

  it("exits early on failure", () => {
    const plugin = notifyOnRebuildPlugin()
    plugin.setup({
      onStart: (_: unknown) => {},
      onEnd(callback: (result: { errors: unknown[] }) => void) {
        callback({ errors: [new Error("Test error")] })
      }
    } as PluginBuild)

    expect(terminal.getSpy("info")).not.toHaveBeenCalledWith(expect.stringMatching(/Templates built in \d+ ms\./))
  })
})

describe("pushOnRebuildPlugin", () => {
  it("pushes search templates after successful build", () => {
    const pushSpy = vi.spyOn(push, "pushSearchTemplate").mockImplementation(() => Promise.resolve())

    fs.writeFolder("build")
    fs.writeFile("build/index.js", "file content")
    fs.writeFile("build/loader.js", "file content")

    const plugin = pushOnRebuildPlugin()
    plugin.setup({
      onEnd(callback: (result: { errors: unknown[] }) => void) {
        callback({ errors: [] })
      }
    } as PluginBuild)

    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        paths: ["build/index.js", "build/loader.js"]
      })
    )
  })

  it("exits early on failure", () => {
    const pushSpy = vi.spyOn(push, "pushSearchTemplate").mockImplementation(() => Promise.resolve())

    fs.writeFolder("build")
    fs.writeFile("build/index.js", "file content")
    fs.writeFile("build/loader.js", "file content")

    const plugin = pushOnRebuildPlugin()
    plugin.setup({
      onEnd(callback: (result: { errors: unknown[] }) => void) {
        callback({ errors: [new Error("Test error")] })
      }
    } as PluginBuild)

    expect(pushSpy).not.toHaveBeenCalled()
  })
})
