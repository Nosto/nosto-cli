import { program } from "commander"
import { pullSearchTemplate } from "./modules/search-templates/pull.ts"
import { pushSearchTemplate } from "./modules/search-templates/push.ts"
import { printStatus } from "./modules/status.ts"
import { loadConfig, updateCachedConfig } from "./config/config.ts"
import { printSetupHelp } from "./modules/setup.ts"

program.name("nostocli").version("1.0.0")

program
  .command("setup")
  .description("Prints setup information")
  .action(() => {
    printSetupHelp()
  })

program
  .command("status [configurationPath]")
  .description("Print the configuration status")
  .action((configurationPath = ".") => {
    printStatus(configurationPath)
  })

const searchTemplates = program
  .command("st")
  .alias("search-templates")
  .description("Search templates management commands")

searchTemplates
  .command("pull [targetPath]")
  .description("Pull the search-templates source from the Nosto VSCode Web")
  .option("-p, --paths <files...>", "specific file paths to fetch (space-separated list)")
  .option("--dry-run", "perform a dry run without making changes")
  .option("-y, --yes", "skip confirmation")
  .action((targetPath, options) => {
    loadConfig(targetPath ?? ".")
    updateCachedConfig({
      dryRun: options.dryRun ?? false
    })
    pullSearchTemplate(targetPath ?? ".", {
      paths: options.paths ?? [],
      skipConfirmation: options.yes ?? false
    })
  })

searchTemplates
  .command("push [targetPath]")
  .description("Push the search-templates source to the VSCode Web")
  .option("-p, --paths <files...>", "specific file paths to deploy (space-separated list)")
  .option("--dry-run", "perform a dry run without making changes")
  .option("-y, --yes", "skip confirmation")
  .action((targetPath, options) => {
    loadConfig(targetPath ?? ".")
    updateCachedConfig({
      dryRun: options.dryRun ?? false
    })
    pushSearchTemplate(targetPath ?? ".", {
      paths: options.paths ?? [],
      skipConfirmation: options.yes ?? false
    })
  })

program.parse(process.argv)
