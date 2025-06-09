#!/usr/bin/env node

import { program } from "commander"
import { fetchTemplates } from "./modules/fetch-templates.js"

program.name("nostocli").version("1.0.0")

program
  .command("fetch-templates <target>")
  .description("Fetch the legacy search-templates from Nosto vscode web")
  .action(async target => {
    fetchTemplates(target)
  })

program
  .command("deploy-templates <target>")
  .description("Deploy the legacy search-templates to Nosto vscode web")
  .action(_ => {
    // TODO
  })

program.parse(process.argv)
