import fs from "fs"
import path from "path"
import z from "zod"

import { Logger } from "#console/logger.ts"

import { type PartialPersistentConfig, PartialPersistentConfigSchema } from "./schema.ts"

export function parseConfigFile({
  projectPath,
  allowIncomplete
}: {
  projectPath: string
  allowIncomplete?: boolean
}): PartialPersistentConfig {
  const configPath = path.join(projectPath, ".nosto.json")

  const configFileMissing = !fs.existsSync(configPath)
  if (allowIncomplete && configFileMissing) {
    return {}
  } else if (configFileMissing) {
    Logger.warn(`Configuration file not found at: ${configPath}. Will try to use environment variables.`)
    return {}
  }

  try {
    const configContent = fs.readFileSync(configPath, "utf-8")
    const rawConfig = JSON.parse(configContent)
    return PartialPersistentConfigSchema.parse(rawConfig)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid configuration file at ${configPath}: ${error.message}`)
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in configuration file at ${configPath}: ${error.message}`)
    }
    throw error
  }
}
