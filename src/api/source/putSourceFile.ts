import ky from "ky"

import { getHeaders, getSourceUrl } from "#api/utils.ts"
import { getCachedConfig } from "#config/config.ts"

export async function putSourceFile(path: string, data: string) {
  if (getCachedConfig().dryRun) {
    return
  }
  const config = getCachedConfig()
  await ky.put(getSourceUrl(`source/{env}/${path}`), {
    headers: getHeaders(),
    body: data,
    searchParams: {
      m: config.merchant
    }
  })
}
