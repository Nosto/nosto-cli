import { Logger } from "#console/logger.ts"
import { NostoError } from "./NostoError.ts"

export class NotNostoTemplateError extends NostoError {
  constructor(message: string) {
    super(message)
    this.name = "NotNostoTemplateError"
  }

  handle() {
    Logger.error(`This doesn't seem to be a Nosto template folder.`)
    Logger.error(`- ${this.message}`)
  }
}
