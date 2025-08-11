import { Logger } from "#console/logger.ts"
import path from "node:path"
import chalk from "chalk"
import { getBuildContext } from "#filesystem/esbuild.ts"
import { getCachedConfig } from "#config/config.ts"
import { loadLibrary } from "#filesystem/loadLibrary.ts"

type Props = {
  watch: boolean
}

export async function buildSearchTemplate({ watch }: Props) {
  const { projectPath } = getCachedConfig()
  const libraryPath = path.resolve(projectPath, ".nostocache/library")
  Logger.info(`Fetching library to: ${chalk.cyan(libraryPath)}`)
  await loadLibrary(libraryPath)

  const targetPath = path.resolve(projectPath, "build")
  Logger.info(`Building templates to: ${chalk.cyan(targetPath)}`)

  const context = await getBuildContext()
  if (!watch) {
    await context.rebuild()
    await context.dispose()
    return
  }

  Logger.info(`Watching for changes. ${chalk.yellow("Press Ctrl+C to stop")}`)
  await context.watch()

  // Set up cleanup on process exit
  process.on("SIGINT", () => {
    context.dispose()
    Logger.info(`${chalk.yellow("Watch mode stopped.")}`)
    process.exit(0)
  })
}
