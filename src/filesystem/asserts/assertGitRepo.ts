import chalk from "chalk"
import fs from "fs"
import path from "path"

import { getCachedConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"

export function assertGitRepo() {
  const { projectPath } = getCachedConfig()

  if (fs.existsSync(path.join(projectPath, ".git"))) {
    return
  }

  const gitCommand = projectPath === "." ? "git init" : `cd ${projectPath} && git init`
  Logger.warn(
    `We heavily recommend using git for your projects. You can start with just running ${chalk.blueBright(gitCommand)}`
  )
}
