import ky from "ky"

import { getJsonHeaders, getSourceUrl } from "#api/utils.ts"

export async function updateDeployment(deploymentId: string) {
  const url = getSourceUrl(`deployment/{env}/${deploymentId}`)

  await ky.post(url, {
    headers: getJsonHeaders()
  })
}
