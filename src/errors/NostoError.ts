import { Logger } from "#console/logger.ts"

export class NostoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NostoError"
  }

  handle() {
    Logger.error(`Generic Nosto error:`)
    Logger.error(`- ${this.message}`)
  }
}
