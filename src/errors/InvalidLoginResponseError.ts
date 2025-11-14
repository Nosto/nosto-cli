import { Logger } from "#console/logger.ts"

import { NostoError } from "./NostoError.ts"

export class InvalidLoginResponseError extends NostoError {
  constructor(message: string) {
    super(message)
    this.name = "InvalidLoginResponseError"
  }

  handle() {
    Logger.error(`Received malformed login response from server. This is probably a bug on our side.`, this)
  }
}
