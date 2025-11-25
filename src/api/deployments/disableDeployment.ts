import ky from "ky"

import { getHeaders, getSourceUrl } from "#api/utils.ts"
import { getCachedConfig } from "#config/config.ts"

export async function disableDeployment() {
  const config = getCachedConfig()

  if (config.dryRun) {
    return
  }

  const url = getSourceUrl(`deployment/{env}`)

  await ky.delete(url, {
    headers: getHeaders()
  })
}
