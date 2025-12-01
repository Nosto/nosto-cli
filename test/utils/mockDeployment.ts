type DeploymentData = {
  id?: string
  created?: number
  active?: boolean
  latest?: boolean
  userId?: string
  description?: string
}

let deploymentCounter = 1763737000

export function createMockDeployment(overrides: DeploymentData = {}) {
  const id = overrides.id ?? String(deploymentCounter++)
  const created = overrides.created ?? 1732200000000
  const active = overrides.active ?? false
  const latest = overrides.latest ?? false

  const deployment: {
    id: string
    created: number
    active: boolean
    latest: boolean
    userId?: string
    description?: string
  } = {
    id,
    created,
    active,
    latest
  }

  // Only add optional fields if they are explicitly provided
  if (overrides.userId !== undefined) {
    deployment.userId = overrides.userId
  }

  if (overrides.description !== undefined) {
    deployment.description = overrides.description
  }

  return deployment
}
