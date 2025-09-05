import chalk from "chalk"
import path from "path"

import { getCachedConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { getBuildContext } from "#filesystem/esbuild.ts"
import { loadLibrary } from "#filesystem/loadLibrary.ts"
import { pushOnRebuildPlugin } from "#filesystem/plugins.ts"

export async function searchTemplateDevMode() {
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
