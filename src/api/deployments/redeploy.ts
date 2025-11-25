import ky from "ky"

import { getHeaders, getJsonHeaders, getSourceUrl } from "#api/utils.ts"

export async function redeploy(deploymentId: string) {
  const url = getSourceUrl(`deployment/{env}/${deploymentId}`)

  await ky.post(url, {
    headers: getJsonHeaders()
  })
}
