import ky from "ky"

import { getJsonHeaders, getSourceUrl } from "#api/utils.ts"

export async function disableDeployment() {
  const url = getSourceUrl(`deployment/{env}`)

  await ky.delete(url, {
    headers: getJsonHeaders()
  })
}
