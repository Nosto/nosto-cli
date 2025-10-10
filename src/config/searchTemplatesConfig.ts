import fs from "fs"
import path from "path"
import z from "zod"

import { NostoError } from "#errors/NostoError.ts"

import { type SearchTemplatesConfig, SearchTemplatesConfigSchema, type SearchTemplatesMode } from "./schema.ts"

export async function parseSearchTemplatesConfigFile({
  projectPath
}: {
  projectPath: string
}): Promise<{ mode: SearchTemplatesMode; data: SearchTemplatesConfig }> {
  const configPath = path.resolve(projectPath, "nosto.config.ts")

  // If config is not present, assume legacy mode
  if (!fs.existsSync(configPath)) {
    return {
      mode: "legacy",
      data: SearchTemplatesConfigSchema.parse({})
    }
  }

  const defaultExport = await import(configPath).then(module => module.default)
  const parsedScriptObject = SearchTemplatesConfigSchema.safeParse(defaultExport)
  if (!parsedScriptObject.success) {
    throw new NostoError("Invalid nosto.config.ts file: " + z.treeifyError(parsedScriptObject.error))
  }
  return {
    mode: "modern",
    data: parsedScriptObject.data
  }
}
