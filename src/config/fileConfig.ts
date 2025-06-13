import path from "path"
import z from "zod"
import fs from "fs"
import { type PartialConfig, PartialConfigSchema } from "./schema.ts"
import { Logger } from "../console/logger.ts"

export function parseConfigFile(targetPath: string): PartialConfig {
  const configPath = path.join(targetPath, ".nosto.json")

  if (!fs.existsSync(configPath)) {
    Logger.warn(`Configuration file not found at: ${configPath}. Will try to use environment variables.`)
    return {}
  }

  try {
    const configContent = fs.readFileSync(configPath, "utf-8")
    const rawConfig = JSON.parse(configContent)
    return PartialConfigSchema.parse(rawConfig)
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
