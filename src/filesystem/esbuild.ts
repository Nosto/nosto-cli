import path from "path"
import * as esbuild from "esbuild"
import { createLoaderPlugin, notifyOnRebuildPlugin } from "./plugins.ts"
import { getCachedConfig } from "../config/config.ts"

export type EsbuildContextOptions = {
  plugins?: esbuild.Plugin[]
}

export function getBuildContext(options: EsbuildContextOptions = {}) {
  const { plugins = [] } = options
  const { projectPath } = getCachedConfig()
  return esbuild.context({
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
      "@nosto/preact": path.resolve(import.meta.dirname, "../../@nosto/preact/nosto.module.js")
    },
    plugins: [createLoaderPlugin(), notifyOnRebuildPlugin(), ...plugins]
  })
}
