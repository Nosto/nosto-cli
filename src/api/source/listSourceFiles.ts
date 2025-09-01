import ky from "ky"

import { getJsonHeaders, getSourceUrl } from "#api/utils.ts"
import { getCachedConfig } from "#config/config.ts"

import { ListSourceFilesSchema } from "./schema.ts"

export async function listSourceFiles() {
  const config = getCachedConfig()
  const response = await ky.get(getSourceUrl("source/{env}"), {
    headers: getJsonHeaders(),
    searchParams: {
      m: config.merchant
    }
  })
  const files = ListSourceFilesSchema.parse(await response.json())
  return files.filter(file => file.path)
}
