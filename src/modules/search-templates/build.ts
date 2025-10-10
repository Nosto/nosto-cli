import path from "node:path"

import chalk from "chalk"

import { getCachedConfig, getCachedSearchTemplatesConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { getBuildContext } from "#filesystem/esbuild.ts"
import { isModernTemplateProject } from "#filesystem/legacyUtils.ts"
import { loadLibrary } from "#filesystem/loadLibrary.ts"

type Props = {
  watch: boolean
}

export async function buildSearchTemplate({ watch }: Props) {
  if (isModernTemplateProject()) {
    await buildModernSearchTemplate({ watch })
  } else {
    await buildLegacySearchTemplate({ watch })
  }
}

async function buildModernSearchTemplate({ watch }: Props) {
  const { onBuild, onBuildWatch } = getCachedSearchTemplatesConfig()

  if (watch) {
    await onBuildWatch({
      onAfterBuild: async () => {}
    })
  } else {
    await onBuild()
  }
}

async function buildLegacySearchTemplate({ watch }: Props) {
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
