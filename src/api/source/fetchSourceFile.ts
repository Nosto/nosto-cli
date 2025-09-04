import ky from "ky"
import z from "zod"

import { getJsonHeaders, getSourceUrl } from "#api/utils.ts"

const FetchSourceFileSchema = z.string()

export async function fetchSourceFile(path: string) {
  const response = await ky.get(getSourceUrl(`source/{env}/${path}`), {
    headers: getJsonHeaders()
  })
  const data = FetchSourceFileSchema.parse(await response.text())
  return data
}

const KyErrorSchema = z.object({
  response: z.object({
    status: z.number(),
    statusText: z.string()
  })
})

export async function fetchSourceFileIfExists(path: string) {
  try {
    return await fetchSourceFile(path)
  } catch (error) {
    const parsedError = KyErrorSchema.safeParse(error)
    if (parsedError.success && parsedError.data.response.status === 404) {
      return null
    }
    throw error
  }
}
