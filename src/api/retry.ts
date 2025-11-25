import chalk from "chalk"

import { Logger } from "#console/logger.ts"

import { deploy } from "./deployments/deploy.ts"
import { putSourceFile } from "./source/putSourceFile.ts"

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

async function executeWithRetry<T>(
  operation: () => Promise<T>,
  filePath: string,
  operationType: "fetch" | "push",
  retryCount = 0
): Promise<T> {
  try {
    return await operation()
  } catch (error: unknown) {
    if (retryCount >= MAX_RETRIES) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (operationType === "fetch") {
        Logger.error(`${chalk.red("✗")} ${chalk.cyan(filePath)}: ${errorMessage}`)
      }
      throw new Error(`Failed to ${operationType} ${filePath} after ${MAX_RETRIES} retries: ${errorMessage}`)
    }
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount)
    Logger.warn(
      `${chalk.yellow("⟳")} Failed to ${operationType} ${chalk.cyan(filePath)}: Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
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
  return executeWithRetry(() => deploy(path, description), path, "push")
}
