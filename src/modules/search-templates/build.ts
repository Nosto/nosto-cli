import { Logger } from "../../console/logger.ts"
import path from "node:path"
import chalk from "chalk"
import { getBuildContext } from "../../filesystem/esbuild.ts"
import { getCachedConfig } from "../../config/config.ts"

type Props = {
  watch: boolean
}

export async function buildSearchTemplate({ watch }: Props) {
  const { projectPath } = getCachedConfig()
  const targetPath = path.resolve(projectPath, "build")
  Logger.info(`Building templates to: ${chalk.cyan(targetPath)}`)

  const context = await getBuildContext()
  if (watch) {
    Logger.info(`Watching for changes. ${chalk.yellow("Press Ctrl+C to stop")}`)
    await context.watch()
    process.on("SIGINT", () => {
      context.dispose()
      Logger.info(`${chalk.yellow("Watch mode stopped.")}`)
      process.exit(0)
    })
  } else {
    await context.rebuild()
    await context.dispose()
  }
}
