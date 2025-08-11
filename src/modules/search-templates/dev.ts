import { Logger } from "#console/logger.ts"
import chalk from "chalk"
import { getCachedConfig } from "#config/config.ts"
import { promptForConfirmation } from "#console/userPrompt.ts"
import { getBuildContext } from "#filesystem/esbuild.ts"
import { pushOnRebuildPlugin } from "#filesystem/plugins.ts"

export type BuildProps = {
  skipConfirmation: boolean
}

export async function searchTemplateDevMode(options: BuildProps) {
  const { skipConfirmation } = options

  if (!skipConfirmation) {
    const config = getCachedConfig()
    const merchant = chalk.greenBright(config.merchant)
    const env = chalk.redBright(config.templatesEnv)
    const apiUrl = chalk.blueBright(config.apiUrl)
    const msgTop = `Dev mode will continuously build and upload files to merchant ${merchant}'s ${env} environment at ${apiUrl}.`
    const confirmationMessage = `${msgTop}\nContinue?`
    const confirmed = await promptForConfirmation(confirmationMessage, "N")
    if (!confirmed) {
      Logger.info("Operation cancelled by user.")
      return
    }
  }

  Logger.info(`Watching for changes. ${chalk.yellow("Press Ctrl+C to stop")}`)

  const context = await getBuildContext({ plugins: [pushOnRebuildPlugin()] })
  await context.watch()

  process.on("SIGINT", () => {
    context.dispose()
    Logger.info(`${chalk.yellow("Watch mode stopped.")}`)
    process.exit(0)
  })
}
