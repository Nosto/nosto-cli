import fs from "fs"
import path from "path"
import { Logger } from "#console/logger.ts"
import { NotNostoTemplateError } from "#errors/NotNostoTemplateError.ts"
import { getCachedConfig } from "#config/config.ts"
import chalk from "chalk"

export function assertNostoTemplate() {
  const { projectPath } = getCachedConfig()

  Logger.debug("Sanity checking the target directory...")
  const targetFolder = path.resolve(projectPath)
  if (!fs.existsSync(targetFolder)) {
    throw new Error(`Target folder does not exist: ${chalk.cyan(targetFolder)}`)
  }
  if (!fs.statSync(targetFolder).isDirectory()) {
    throw new Error(`Target path is not a directory: ${chalk.cyan(targetFolder)}`)
  }

  const indexFilePath = path.join(projectPath, "index.js")
  if (!fs.existsSync(indexFilePath)) {
    throw new NotNostoTemplateError(`Index file does not exist: ${indexFilePath}`)
  }
  const indexFileContent = fs.readFileSync(indexFilePath, "utf-8")
  if (!indexFileContent.includes("@nosto/preact")) {
    throw new NotNostoTemplateError(`Index file does not contain @nosto/preact: ${indexFilePath}`)
  }
}
