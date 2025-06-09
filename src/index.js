#!/usr/bin/env node
import { program } from "commander"
import { fetchTemplates } from "./modules/fetch-templates.js"
import { deployTemplates } from "./modules/deploy-templates.js"

program.name("nostocli").version("1.0.0")

program
  .command("fetch-templates <targetPath>")
  .description("Fetch the legacy search-templates from Nosto vscode web")
  .option("-p, --paths <files...>", "specific file paths to fetch (space-separated list)")
  .action((targetPath, options) => {
    fetchTemplates(targetPath, options.paths || [])
  })

program
  .command("deploy-templates <targetPath>")
  .description("Deploy the legacy search-templates to Nosto vscode web")
  .option("-p, --paths <files...>", "specific file paths to deploy (space-separated list)")
  .action((targetPath, options) => {
    deployTemplates(targetPath, options.paths || [])
  })

program.parse(process.argv)
