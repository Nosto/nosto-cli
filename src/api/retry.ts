import chalk from "chalk"

import { getCachedConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"

import { createDeployment } from "./deployments/createDeployment.ts"
import { putSourceFile } from "./source/putSourceFile.ts"

async function executeWithRetry<T>(
  operation: () => Promise<T>,
  filePath: string,
  operationType: "fetch" | "push",
  retryCount = 0
): Promise<T> {
  const config = getCachedConfig()

  try {
    return await operation()
  } catch (error: unknown) {
    if (retryCount >= config.maxRetryCount) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (operationType === "fetch") {
        Logger.error(`${chalk.red("✗")} ${chalk.cyan(filePath)}: ${errorMessage}`)
      }
      throw new Error(`Failed to ${operationType} ${filePath} after ${retryCount} retries: ${errorMessage}`, {
        cause: error
      })
    }

    const delay = config.retryDelay * Math.pow(2, retryCount)
    Logger.warn(
      `${chalk.yellow("⟳")} Failed to ${operationType} ${chalk.cyan(filePath)}: Retrying in ${delay}ms (attempt ${retryCount + 1}/${config.maxRetryCount})`
    )

    await new Promise(resolve => setTimeout(resolve, delay))
    return executeWithRetry(operation, filePath, operationType, retryCount + 1)
  }
}

export async function fetchWithRetry(
  apiFunction: (filePath: string) => Promise<string>,
  filePath: string
): Promise<string> {
  return executeWithRetry(() => apiFunction(filePath), filePath, "fetch")
}

export async function putWithRetry(filePath: string, content: string): Promise<void> {
  return executeWithRetry(() => putSourceFile(filePath, content), filePath, "push")
}

export async function deployWithRetry(path: string, description: string): Promise<void> {
  return executeWithRetry(() => createDeployment({ path, description }), path, "push")
}
