import ky from "ky"
import z from "zod"

import { cleanUrl, getJsonHeaders } from "#api/utils.ts"
import { getCachedConfig } from "#config/config.ts"

const FetchSourceFileSchema = z.string()

export async function fetchLibraryFile(path: string) {
  const config = getCachedConfig()
  const url = `${config.libraryUrl}/${cleanUrl(path)}`

  const response = await ky.get(url.toString(), {
    headers: getJsonHeaders()
  })
  const data = FetchSourceFileSchema.parse(await response.text())
  return data
}
