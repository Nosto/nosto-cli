import ky from "ky"

import { getJsonHeaders, getSourceUrl } from "#api/utils.ts"

import { ListDeploymentsSchema } from "./schema.ts"

export async function listDeployments() {
  const response = await ky.get(getSourceUrl("deployments/{env}"), {
    headers: getJsonHeaders(),
    retry: 0
  })
  return ListDeploymentsSchema.parse(await response.json())
}
