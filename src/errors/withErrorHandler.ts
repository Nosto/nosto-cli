import { Logger } from "../console/logger.ts"
import { MissingConfigurationError } from "./MissingConfigurationError.ts"

export async function withErrorHandler(fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
  } catch (error) {
    if (error instanceof MissingConfigurationError) {
      Logger.error(error.message)
    } else {
      throw error
    }
  }
}
