import ky from "ky"

import { getHeaders, getJsonHeaders, getSourceUrl } from "#api/utils.ts"
import { getCachedConfig } from "#config/config.ts"

export async function deploy(path: string, description: string) {
  const config = getCachedConfig()

  if (config.dryRun) {
    return
  }

  const url = getSourceUrl(`deployments/{env}/${path}`)

  await ky.post(url, {
    headers: getJsonHeaders(),
    body: JSON.stringify({ description })
  })
}
