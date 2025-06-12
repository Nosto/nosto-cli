#!/usr/bin/env node
import { program } from "commander"
import { pullSearchTemplate } from "./modules/search-templates/pull.ts"
import { pushSearchTemplate } from "./modules/search-templates/push.ts"

program.name("nostocli").version("1.0.0")

program
  .command("fetch-templates <targetPath>")
  .description("Fetch the legacy search-templates from Nosto vscode web")
  .option("-p, --paths <files...>", "specific file paths to fetch (space-separated list)")
  .action((targetPath, options) => {
    pullSearchTemplate(targetPath, options.paths || [])
  })

program
  .command("deploy-templates <targetPath>")
  .description("Deploy the legacy search-templates to Nosto vscode web")
  .option("-p, --paths <files...>", "specific file paths to deploy (space-separated list)")
  .action((targetPath, options) => {
    pushSearchTemplate(targetPath, options.paths || [])
  })

program.parse(process.argv)
