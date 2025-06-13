import { program } from "commander"
import { pullSearchTemplate } from "./modules/search-templates/pull.ts"
import { pushSearchTemplate } from "./modules/search-templates/push.ts"
import { printStatus } from "./modules/status.ts"
import { loadConfig, updateCachedConfig } from "./config/config.ts"
import { printSetupHelp } from "./modules/setup.ts"
import { withErrorHandler } from "./errors/withErrorHandler.ts"

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
  .command("pull [projectPath]")
  .description("Pull the search-templates source from the Nosto VSCode Web")
  .option("-p, --paths <files...>", "specific file paths to fetch (space-separated list)")
  .option("--dry-run", "perform a dry run without making changes")
  .option("-y, --yes", "skip confirmation")
  .action((projectPath = ".", options) => {
    withErrorHandler(async () => {
      loadConfig(projectPath)
      updateCachedConfig({
        dryRun: options.dryRun ?? false
      })
      await pullSearchTemplate(projectPath, {
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
  .option("-y, --yes", "skip confirmation")
  .action((projectPath = ".", options) => {
    withErrorHandler(async () => {
      loadConfig(projectPath)
      updateCachedConfig({
        dryRun: options.dryRun ?? false
      })
      await pushSearchTemplate(projectPath, {
        paths: options.paths ?? [],
        skipConfirmation: options.yes ?? false
      })
    })
  })

program.parse(process.argv)
