import path from "path"
import fs from "fs"
import { Logger } from "../console/logger.ts"
import { getCachedConfig } from "../config/config.ts"

export function writeFile(pathToWrite: string, data: string) {
  if (getCachedConfig().dryRun) {
    return
  }
  if (!fs.existsSync(path.dirname(pathToWrite))) {
    Logger.debug(`Creating directory: ${path.dirname(pathToWrite)}`)
    fs.mkdirSync(path.dirname(pathToWrite), { recursive: true })
  }
  Logger.debug(`Writing to file: ${pathToWrite}`)
  fs.writeFileSync(pathToWrite, data)
}
