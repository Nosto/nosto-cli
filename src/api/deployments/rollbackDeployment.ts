import ky from "ky"

import { getJsonHeaders, getSourceUrl } from "#api/utils.ts"

export async function rollbackDeployment() {
  const url = getSourceUrl(`deployment/{env}`)

  await ky.delete(url, {
    headers: getJsonHeaders()
  })
}
