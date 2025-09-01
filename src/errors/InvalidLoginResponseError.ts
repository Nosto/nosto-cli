import { Logger } from "#console/logger.ts"

import { NostoError } from "./NostoError.ts"

export class InvalidLoginResponseError extends NostoError {
  constructor(message: string) {
    super(message)
    this.name = "InvalidLoginResponseError"
  }

  handle() {
    Logger.error(this.message)
  }
}
