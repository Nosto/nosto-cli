import fs from "fs"

import { AuthConfigFilePath } from "#config/authConfig.ts"
import { Logger } from "#console/logger.ts"

export function removeLoginCredentials() {
  Logger.info(`Deleting stored login credentials at ${AuthConfigFilePath}`)
  if (!fs.existsSync(AuthConfigFilePath)) {
    Logger.warn(`File already deleted.`)
    return
  }
  fs.unlinkSync(AuthConfigFilePath)
}
