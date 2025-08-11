import { HTTPError, TimeoutError } from "ky"
import { Logger } from "#console/logger.ts"
import { MissingConfigurationError } from "./MissingConfigurationError.ts"
import chalk from "chalk"
import { getCachedConfig } from "#config/config.ts"

export async function withErrorHandler(fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
  } catch (error) {
    if (error instanceof MissingConfigurationError) {
      Logger.error(error.message)
    } else if (error instanceof HTTPError) {
      const config = getCachedConfig()
      Logger.error(`HTTP Request failed:`)
      Logger.error(`- ${error.response.status} ${error.response.statusText}`)
      Logger.error(`- ${error.request.method} ${error.request.url}`)
      if (config.verbose) {
        Logger.raw(chalk.red(prettyPrintStack(error.stack)))
      }
      if (!config.verbose) {
        Logger.info(chalk.gray("Rerun with --verbose to see details"))
      }
    } else if (error instanceof TimeoutError) {
      const config = getCachedConfig()
      Logger.error(`HTTP Request timed out:`)
      Logger.error(`- Server did not respond after 10 seconds`)
      Logger.error(`- ${error.request.method} ${error.request.url}`)
      if (config.verbose) {
        Logger.raw(chalk.red(prettyPrintStack(error.stack)))
      }
    } else {
      throw error
    }
  }
}

export function prettyPrintStack(stack: string | undefined) {
  if (!stack) {
    return ""
  }
  const lines = stack.split("\n")
  const filteredLines = lines.filter(line => line.includes(".ts"))
  return filteredLines.join("\n")
}
