import ky from "ky"

import { getHeaders, getSourceUrl } from "#api/utils.ts"
import { getCachedConfig } from "#config/config.ts"

export async function deploy(path: string, description: string) {
  const config = getCachedConfig()

  if (config.dryRun) {
    return
  }

  const authenticityToken = config.auth.token
  const url = getSourceUrl(`deployments/${authenticityToken}/{env}/${path}`)

  await ky.post(url, {
    headers: getHeaders(),
    body: JSON.stringify({ description })
  })
}
