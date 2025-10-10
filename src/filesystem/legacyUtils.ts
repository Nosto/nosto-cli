import fs from "fs"
import path from "path"

import { getCachedConfig } from "#config/config.ts"

export function isModernTemplateProject() {
  const { projectPath } = getCachedConfig()
  const deployManifest = path.resolve(projectPath, "nosto.config.ts")
  return fs.existsSync(deployManifest)
}
