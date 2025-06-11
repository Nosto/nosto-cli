import { program } from "commander"
import { fetchTemplates } from "./modules/fetch-templates.ts"
import { deployTemplates } from "./modules/deploy-templates.ts"
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

program
  .command("fetch-templates <targetPath>")
  .description("Fetch the legacy search-templates from Nosto vscode web")
  .option("-p, --paths <files...>", "specific file paths to fetch (space-separated list)")
  .action((targetPath, options) => {
    loadConfig(targetPath)
    fetchTemplates(targetPath, options.paths || [])
  })

program
  .command("deploy-templates <targetPath>")
  .description("Deploy the legacy search-templates to Nosto vscode web")
  .option("-p, --paths <files...>", "specific file paths to deploy (space-separated list)")
  .action((targetPath, options) => {
    loadConfig(targetPath)
    deployTemplates(targetPath, options.paths || [])
  })

program.parse(process.argv)
