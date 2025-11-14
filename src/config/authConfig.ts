import fs from "fs"
import path from "path"
import z from "zod"

import { MissingConfigurationError } from "#errors/MissingConfigurationError.ts"
import { HomeDirectory } from "#filesystem/homeDirectory.ts"

import { type AuthConfig, AuthConfigSchema } from "./schema.ts"

export const AuthConfigFilePath = path.join(HomeDirectory, ".nosto", ".auth.json")

export function authFileExists() {
  return fs.existsSync(AuthConfigFilePath)
}

export function getAuthFileMissingError() {
  return new MissingConfigurationError(
    `Auth file not found at: ${AuthConfigFilePath}. You will not be able to use most commands without running 'nosto login' first.`
  )
}

export function parseAuthFile({ allowIncomplete }: { allowIncomplete?: boolean }): AuthConfig {
  if (!allowIncomplete && !authFileExists()) {
    throw getAuthFileMissingError()
  } else if (!authFileExists()) {
    return { user: "", token: "", expiresAt: new Date(0) }
  }

  try {
    const configContent = fs.readFileSync(AuthConfigFilePath, "utf-8")
    const rawConfig = JSON.parse(configContent)
    return AuthConfigSchema.parse(rawConfig)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid auth file at ${AuthConfigFilePath}: ${error.message}`)
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in auth file at ${AuthConfigFilePath}: ${error.message}`)
    }
    throw error
  }
}
