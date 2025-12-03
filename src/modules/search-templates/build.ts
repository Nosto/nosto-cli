import path from "node:path"

import chalk from "chalk"

import { getCachedConfig, getCachedSearchTemplatesConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { getBuildContext } from "#filesystem/esbuild.ts"
import { isModernTemplateProject } from "#filesystem/legacyUtils.ts"
import { loadLibrary } from "#filesystem/loadLibrary.ts"

import { pushSearchTemplate } from "./push.ts"

type Props = {
  watch: boolean
  push?: boolean
}

export async function buildSearchTemplate({ watch, push = false }: Props) {
  if (isModernTemplateProject()) {
    await buildModernSearchTemplate({ watch, push })
  } else {
    await buildLegacySearchTemplate({ watch, push })
  }
}

async function buildModernSearchTemplate({ watch, push }: Props) {
  const { onBuild, onBuildWatch } = getCachedSearchTemplatesConfig()

  if (watch) {
    await onBuildWatch({
      onAfterBuild: async () => {}
    })
  } else {
    await onBuild()
  }

  if (push && !watch) {
    Logger.info("")
    await pushSearchTemplate({ paths: ["build"], force: false })
  }
}

async function buildLegacySearchTemplate({ watch, push }: Props) {
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

    if (push) {
      Logger.info("")
      await pushSearchTemplate({ paths: ["build"], force: false })
    }
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
