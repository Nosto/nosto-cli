import { program } from "commander"
import { pullSearchTemplate } from "./modules/search-templates/pull.ts"
import { pushSearchTemplate } from "./modules/search-templates/push.ts"
import { printStatus } from "./modules/status.ts"
import { loadConfig } from "./config/config.ts"
import { printSetupHelp } from "./modules/help.ts"

program.name("nostocli").version("1.0.0")

program
  .command("help")
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
  .command("pull <targetPath>")
  .description("Pull the search-templates source from the Nosto VSCode Web")
  .option("-p, --paths <files...>", "specific file paths to fetch (space-separated list)")
  .action((targetPath, options) => {
    loadConfig(targetPath)
    pullSearchTemplate(targetPath, options.paths || [])
  })

searchTemplates
  .command("push <targetPath>")
  .description("Push the search-templates source to the VSCode Web")
  .option("-p, --paths <files...>", "specific file paths to deploy (space-separated list)")
  .action((targetPath, options) => {
    loadConfig(targetPath)
    pushSearchTemplate(targetPath, options.paths || [])
  })

program.parse(process.argv)
