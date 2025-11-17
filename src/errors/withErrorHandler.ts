import chalk from "chalk"
import { HTTPError, TimeoutError } from "ky"

import { getCachedConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"

import { NostoError } from "./NostoError.ts"

export async function withErrorHandler(fn: () => void | Promise<void>): Promise<void> {
  function printStack(error: Error) {
    const config = getCachedConfig()
    if (config.verbose) {
      Logger.raw(chalk.red(prettyPrintStack(error.stack)))
    } else {
      Logger.info(chalk.gray("Rerun with --verbose to see details"))
    }
  }
  try {
    await fn()
  } catch (error) {
    if (error instanceof HTTPError) {
      Logger.error(`HTTP Request failed:`)
      Logger.error(`- ${error.response.status} ${error.response.statusText}`)
      Logger.error(`- ${error.request.method} ${error.request.url}`)
      printStack(error)
    } else if (error instanceof TimeoutError) {
      Logger.error(`HTTP Request timed out:`)
      Logger.error(`- Server did not respond after 10 seconds`)
      Logger.error(`- ${error.request.method} ${error.request.url}`)
      printStack(error)
    } else if (error instanceof NostoError) {
      error.handle()
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
