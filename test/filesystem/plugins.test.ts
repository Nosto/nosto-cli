import { PluginBuild } from "esbuild"
import { describe, it } from "vitest"

import { createLoaderPlugin } from "#filesystem/esbuildPlugins.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()

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
