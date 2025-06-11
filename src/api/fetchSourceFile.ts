import ky from "ky"
import { getJsonHeaders, getUrl } from "./utils.ts"
import z from "zod"

const FetchSourceFileSchema = z.string()

export async function fetchSourceFile(path: string) {
  const response = await ky.get(getUrl(`source/{env}/${path}`), { headers: getJsonHeaders() })
  if (!response.ok) {
    throw new Error(`Failed to fetch source file: ${response.statusText}`)
  }
  const data = FetchSourceFileSchema.parse(await response.text())
  return data
}
