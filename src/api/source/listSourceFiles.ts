import ky from "ky"

import { getJsonHeaders, getSourceUrl } from "#api/utils.ts"

import { ListSourceFilesSchema } from "./schema.ts"

export async function listSourceFiles() {
  const response = await ky.get(getSourceUrl("source/{env}"), {
    headers: getJsonHeaders(),
    retry: 0
  })
  const files = ListSourceFilesSchema.parse(await response.json())
  return files.filter(file => file.path)
}
