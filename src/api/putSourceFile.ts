import ky from "ky"
import { getHeaders, getUrl } from "./utils.ts"
import { getCachedConfig } from "../config/config.ts"

export async function putSourceFile(path: string, data: string) {
  if (getCachedConfig().dryRun) {
    return
  }
  const response = await ky.put(getUrl(`source/{env}/${path}`), {
    headers: getHeaders(),
    body: data
  })
  if (!response.ok) {
    throw new Error(`Failed to put source file: ${response.statusText}`)
  }
}
