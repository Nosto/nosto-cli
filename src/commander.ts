import { Command } from "commander"

import { loadConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"
import { withErrorHandler } from "#errors/withErrorHandler.ts"
import { loginToPlaycart } from "#modules/login.ts"
import { removeLoginCredentials } from "#modules/logout.ts"
import { buildSearchTemplate } from "#modules/search-templates/build.ts"
import { searchTemplateDevMode } from "#modules/search-templates/dev.ts"
import { pullSearchTemplate } from "#modules/search-templates/pull.ts"
import { pushSearchTemplate } from "#modules/search-templates/push.ts"
import { printSetupHelp } from "#modules/setup.ts"
import { printStatus } from "#modules/status.ts"
import { withSafeEnvironment } from "#utils/withSafeEnvironment.ts"

export async function runCLI(argv: string[]) {
  const program = new Command()
  program.name("nostocli").version("1.0.0").description("Nosto CLI tool. Use `nostocli setup` to get started.")

  program
    .command("login")
    .description("Login with your Nosto account")
    .option("--verbose", "set log level to debug")
    .action(async options => {
      await loadConfig({ options, allowIncomplete: true, projectPath: "." })
      await withErrorHandler(async () => {
        await loginToPlaycart()
      })
      Logger.info("Login successful")
    })

  program
    .command("logout")
    .description("Delete stored login credentials")
    .option("--verbose", "set log level to debug")
    .action(() => {
      removeLoginCredentials()
    })

  program
    .command("setup [projectPath]")
    .description("Prints setup information and creates a configuration file")
    .option("-m, --merchant <merchant>", "merchant to create config for")
    .action(async (projectPath = ".", options) => {
      await loadConfig({ options, allowIncomplete: true, projectPath: "." })
      await withErrorHandler(() => printSetupHelp(projectPath, options))
    })

  program
    .command("status [projectPath]")
    .description("Print the configuration status")
    .action(async (projectPath = ".", options) => {
      await loadConfig({ options, allowIncomplete: true, projectPath: "." })
      await withErrorHandler(() => printStatus(projectPath))
    })

  const searchTemplates = program
    .command("st")
    .alias("search-templates")
    .description("Search templates management commands")

  searchTemplates
    .command("pull [projectPath]")
    .description("Pull the search-templates source from the Nosto VSCode Web")
    .option("-p, --paths <files...>", "specific file paths to fetch (space-separated list)")
    .option("--dry-run", "perform a dry run without making changes")
    .option("--verbose", "set log level to debug")
    .option("-f --force", "skip checking state, pull all files")
    .action(async (projectPath = ".", options) => {
      await withSafeEnvironment({ projectPath, options, skipSanityCheck: true }, async () => {
        await pullSearchTemplate({
          paths: options.paths ?? [],
          force: options.force ?? false
        })
      })
    })

  searchTemplates
    .command("push [projectPath]")
    .description("Push the search-templates source to the VSCode Web")
    .option("-p, --paths <files...>", "specific file paths to deploy (space-separated list)")
    .option("--dry-run", "perform a dry run without making changes")
    .option("--verbose", "set log level to debug")
    .option("-f --force", "skip checking state, push all files")
    .action(async (projectPath = ".", options) => {
      await withSafeEnvironment({ projectPath, options }, async () => {
        await buildSearchTemplate({ watch: false })
        await pushSearchTemplate({
          paths: options.paths ?? [],
          force: options.force ?? false
        })
      })
    })

  searchTemplates
    .command("build [projectPath]")
    .description("Build the search-templates locally")
    .option("--dry-run", "perform a dry run without making changes")
    .option("--verbose", "set log level to debug")
    .option("-w, --watch", "watch for changes and rebuild")
    .action(async (projectPath = ".", options) => {
      await withSafeEnvironment({ projectPath, options }, async () => {
        await buildSearchTemplate({ watch: options.watch ?? false })
      })
    })

  searchTemplates
    .command("dev [projectPath]")
    .description("Build the search-templates locally, watch for changes and continuously upload")
    .option("--dry-run", "perform a dry run without making changes")
    .option("--verbose", "set log level to debug")
    .action(async (projectPath = ".", options) => {
      await withSafeEnvironment({ projectPath, options }, async () => {
        await searchTemplateDevMode()
      })
    })

  await program.parseAsync(argv)
}
