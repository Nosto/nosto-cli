import { program } from "commander"
import { pullSearchTemplate } from "./modules/search-templates/pull.ts"
import { pushSearchTemplate } from "./modules/search-templates/push.ts"
import { printStatus } from "./modules/status.ts"
import { loadConfig } from "./config/config.ts"
import { printSetupHelp } from "./modules/setup.ts"
import { withErrorHandler } from "./errors/withErrorHandler.ts"
import { buildSearchTemplate } from "./modules/search-templates/build.ts"
import { searchTemplateDevMode } from "./modules/search-templates/dev.ts"

program.name("nostocli").version("1.0.0").description("Nosto CLI tool. Use `nostocli setup` to get started.")

program
  .command("setup [projectPath]")
  .description("Prints setup information")
  .action((projectPath = ".") => {
    withErrorHandler(() => printSetupHelp(projectPath))
  })

program
  .command("status [projectPath]")
  .description("Print the configuration status")
  .action((projectPath = ".") => {
    withErrorHandler(() => printStatus(projectPath))
  })

const searchTemplates = program
  .command("st")
  .alias("search-templates")
  .description("Search templates management commands")

searchTemplates
  .command("build [projectPath]")
  .description("Build the search-templates locally")
  .option("--dry-run", "perform a dry run without making changes")
  .option("--verbose", "set log level to debug")
  .option("-w, --watch", "skip confirmation")
  .action((projectPath = ".", options) => {
    withErrorHandler(async () => {
      loadConfig({ projectPath, options })
      await buildSearchTemplate({ watch: options.watch ?? false })
    })
  })

searchTemplates
  .command("pull [projectPath]")
  .description("Pull the search-templates source from the Nosto VSCode Web")
  .option("-p, --paths <files...>", "specific file paths to fetch (space-separated list)")
  .option("--dry-run", "perform a dry run without making changes")
  .option("--verbose", "set log level to debug")
  .option("-y, --yes", "skip confirmation")
  .action((projectPath = ".", options) => {
    withErrorHandler(async () => {
      loadConfig({ projectPath, options })
      await pullSearchTemplate({
        paths: options.paths ?? [],
        skipConfirmation: options.yes ?? false
      })
    })
  })

searchTemplates
  .command("push [projectPath]")
  .description("Push the search-templates source to the VSCode Web")
  .option("-p, --paths <files...>", "specific file paths to deploy (space-separated list)")
  .option("--dry-run", "perform a dry run without making changes")
  .option("--verbose", "set log level to debug")
  .option("-y, --yes", "skip confirmation")
  .action((projectPath = ".", options) => {
    withErrorHandler(async () => {
      loadConfig({ projectPath, options })
      await buildSearchTemplate({ watch: false })
      await pushSearchTemplate({
        paths: options.paths ?? [],
        skipConfirmation: options.yes ?? false
      })
    })
  })

searchTemplates
  .command("dev [projectPath]")
  .description("Build the search-templates locally, watch for changes and continuously upload")
  .option("--dry-run", "perform a dry run without making changes")
  .option("--verbose", "set log level to debug")
  .option("-y, --yes", "skip confirmation")
  .action((projectPath = ".", options) => {
    withErrorHandler(async () => {
      loadConfig({ projectPath, options })
      await searchTemplateDevMode({
        skipConfirmation: options.yes ?? false
      })
    })
  })

program.parse(process.argv)
