import ky from "ky"

import { getJsonHeaders, getSourceUrl } from "#api/utils.ts"

export async function deploy(path: string, description: string) {
  const url = getSourceUrl(`deployments/{env}/${path}`)

  await ky.post(url, {
    headers: getJsonHeaders(),
    body: JSON.stringify({ description })
  })
}
