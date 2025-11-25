import ky from "ky"

import { getHeaders, getSourceUrl } from "#api/utils.ts"
import { getCachedConfig } from "#config/config.ts"

export async function redeploy(deploymentId: string) {
  const config = getCachedConfig()

  if (config.dryRun) {
    return
  }

  const url = getSourceUrl(`deployment/{env}/${deploymentId}`)

  await ky.post(url, {
    headers: getHeaders()
  })
}
