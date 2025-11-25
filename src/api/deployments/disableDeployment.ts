import ky from "ky"

import { getHeaders, getSourceUrl } from "#api/utils.ts"

export async function disableDeployment() {
  const url = getSourceUrl(`deployment/{env}`)

  await ky.delete(url, {
    headers: getHeaders()
  })
}
