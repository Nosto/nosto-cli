import * as esbuild from "esbuild"
import path from "node:path"
import fs from "fs"
import { getLoaderScript } from "#filesystem/utils/getLoaderScript.ts"
import { Logger } from "#console/logger.ts"
import { getCachedConfig } from "#config/config.ts"
import chalk from "chalk"
import { pushSearchTemplate } from "#modules/search-templates/push.ts"

export function createLoaderPlugin(): esbuild.Plugin {
  return {
    name: "create-loader",
    setup(build) {
      build.onEnd(result => {
        if (result.errors.length) {
          return
        }
        Logger.debug("Generating loader script...")
        const { projectPath } = getCachedConfig()
        const outUri = path.join(projectPath, "build")
        fs.writeFileSync(path.join(outUri, "loader.js"), getLoaderScript())
      })
    }
  }
}

/**
 * By default, esbuild is silent. This plugin prints a log message with some rebuild stats.
 */
const performanceStats = {
  lastBuildStartedAt: 0
}
export function notifyOnRebuildPlugin(): esbuild.Plugin {
  return {
    name: "notify-on-rebuild",
    setup(build) {
      build.onStart(() => {
        performanceStats.lastBuildStartedAt = performance.now()
      })
      build.onEnd(result => {
        if (result.errors.length) {
          return
        }
        const duration = performance.now() - performanceStats.lastBuildStartedAt
        Logger.info(`Templates built in ${chalk.green(Math.round(duration) + " ms")}.`)
      })
    }
  }
}

export function pushOnRebuildPlugin(): esbuild.Plugin {
  return {
    name: "push-on-rebuild",
    setup(build) {
      build.onEnd(result => {
        if (result.errors.length) {
          return
        }

        // Only push built files
        const { projectPath } = getCachedConfig()
        const buildPath = path.resolve(projectPath, "build")
        const files = fs.readdirSync(buildPath)
        const paths = files.map(file => path.relative(projectPath, path.resolve(buildPath, file)))

        pushSearchTemplate({ paths, force: false })
      })
    }
  }
}
