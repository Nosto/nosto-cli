import { Logger } from "../../console/logger.ts"
import chalk from "chalk"
import { getBuildContext } from "../../filesystem/esbuild.ts"
import { pushOnRebuildPlugin } from "../../filesystem/plugins.ts"

export async function searchTemplateDevMode() {
  Logger.info(`Watching for changes. ${chalk.yellow("Press Ctrl+C to stop")}`)

  const context = await getBuildContext({ plugins: [pushOnRebuildPlugin()] })
  await context.watch()

  process.on("SIGINT", () => {
    context.dispose()
    Logger.info(`${chalk.yellow("Watch mode stopped.")}`)
    process.exit(0)
  })
}
