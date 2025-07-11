import ky from "ky"
import { getJsonHeaders, getSourceUrl } from "../utils.ts"
import z from "zod"

const FetchSourceFileSchema = z.string()

export async function fetchSourceFile(path: string) {
  const response = await ky.get(getSourceUrl(`source/{env}/${path}`), {
    headers: getJsonHeaders()
  })
  const data = FetchSourceFileSchema.parse(await response.text())
  return data
}

export async function fetchSourceFileIfExists(path: string) {
  try {
    return await fetchSourceFile(path)
  } catch {
    return null
  }
}
