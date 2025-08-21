import chalk from "chalk"
import { Logger } from "#console/logger.ts"

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

export async function fetchWithRetry(
  apiFunction: (filePath: string) => Promise<string>,
  filePath: string,
  retryCount = 0
): Promise<string> {
  try {
    return await apiFunction(filePath)
  } catch (error: unknown) {
    if (retryCount >= MAX_RETRIES) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      Logger.error(`${chalk.red("✗")} ${chalk.cyan(filePath)}: ${errorMessage}`)
      throw new Error(`Failed to fetch ${filePath} after ${MAX_RETRIES} retries: ${errorMessage}`)
    }
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount)
    Logger.warn(
      `${chalk.yellow("⟳")} Failed to fetch ${chalk.cyan(filePath)}: Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
    )
    await new Promise(resolve => setTimeout(resolve, delay))
    return fetchWithRetry(apiFunction, filePath, retryCount + 1)
  }
}
