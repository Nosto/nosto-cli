import { Logger } from "#console/logger.ts"

import { NostoError } from "./NostoError.ts"

export class MissingConfigurationError extends NostoError {
  constructor(message: string) {
    super(message)
    this.name = "MissingConfigurationError"
  }

  handle() {
    Logger.error(this.message)
  }
}
