import { context, type Plugin } from "esbuild"
import path from "path"

import { getCachedConfig } from "#config/config.ts"

import { createLoaderPlugin, notifyOnRebuildPlugin } from "./esbuildPlugins.ts"

export type EsbuildContextOptions = {
  plugins?: Plugin[]
}

export function getBuildContext(options: EsbuildContextOptions = {}) {
  const { plugins = [] } = options
  const { projectPath } = getCachedConfig()
  return context({
    bundle: true,
    minify: true,
    write: true,
    nodePaths: [path.resolve(import.meta.dirname, "../../node_modules")],
    sourcemap: "linked",
    treeShaking: true,
    jsx: "automatic",
    jsxImportSource: "preact",
    jsxFragment: "Fragment",
    metafile: true,
    target: ["es2018"],
    supported: {
      nesting: false // transpile nested CSS to flat
    },
    outfile: path.resolve(projectPath, "build/bundle.js"),
    entryPoints: [path.resolve(projectPath, "index.js")],
    alias: {
      "@nosto/preact": path.resolve(projectPath, ".nostocache/library/nosto.module.js")
    },
    plugins: [createLoaderPlugin(), notifyOnRebuildPlugin(), ...plugins]
  })
}
