import chalk from "chalk"
import path from "path"

import { getCachedConfig, getCachedSearchTemplatesConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { getBuildContext } from "#filesystem/esbuild.ts"
import { pushOnRebuildPlugin } from "#filesystem/esbuildPlugins.ts"
import { isModernTemplateProject } from "#filesystem/legacyUtils.ts"
import { loadLibrary } from "#filesystem/loadLibrary.ts"

import { pushSearchTemplate } from "./push.ts"

export async function searchTemplateDevMode() {
  if (isModernTemplateProject()) {
    await modernSearchTemplateDevMode()
  } else {
    await legacySearchTemplateDevMode()
  }
}

async function modernSearchTemplateDevMode() {
  const { onBuildWatch } = getCachedSearchTemplatesConfig()

  Logger.info(`Starting dev mode. ${chalk.yellow("Press Ctrl+C to stop")}`)

  await onBuildWatch({
    onAfterBuild: async () => {
      pushSearchTemplate({ paths: ["build"], force: false })
    }
  })
}

async function legacySearchTemplateDevMode() {
  const { projectPath } = getCachedConfig()
  const libraryPath = path.resolve(projectPath, ".nostocache/library")

  Logger.info(`Fetching library to: ${chalk.cyan(libraryPath)}`)
  await loadLibrary(libraryPath)

  Logger.info(`Watching for changes. ${chalk.yellow("Press Ctrl+C to stop")}`)

  const context = await getBuildContext({ plugins: [pushOnRebuildPlugin()] })
  await context.watch()

  process.on("SIGINT", () => {
    context.dispose()
    Logger.info(`${chalk.yellow("Watch mode stopped.")}`)
    process.exit(0)
  })
}
