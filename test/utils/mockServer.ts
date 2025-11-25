import { SetupServer, setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest"

// Deployment API functions (imported for ReturnType type inference)
import { deploy } from "#api/deployments/deploy.ts"
import { disableDeployment } from "#api/deployments/disableDeployment.ts"
import { listDeployments } from "#api/deployments/listDeployments.ts"
import { redeploy } from "#api/deployments/redeploy.ts"
// Library and source API functions (imported for ReturnType type inference)
import { fetchLibraryFile } from "#api/library/fetchLibraryFile.ts"
import { fetchSourceFile } from "#api/source/fetchSourceFile.ts"
import { listSourceFiles } from "#api/source/listSourceFiles.ts"
import { putSourceFile } from "#api/source/putSourceFile.ts"
import { getSourceUrl } from "#api/utils.ts"
import { generateEndpointMock, MockParams } from "#test/utils/generateEndpointMock.ts"

export const setupMockServer = () => {
  const server = setupServer()
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" })
  })
  beforeEach(() => {
    mockFetchSourceFile(server, {
      path: "build/hash",
      error: { status: 404, message: "Not Found" }
    })
    mockPutSourceFile(server, {
      path: "build/hash"
    })
  })
  afterEach(() => {
    server.resetHandlers()
  })
  afterAll(() => server.close())

  return server
}

export function mockListSourceFiles(
  server: SetupServer,
  params: MockParams<Awaited<ReturnType<typeof listSourceFiles>>>
) {
  return generateEndpointMock(server, {
    ...params,
    method: "get",
    path: getSourceUrl("source/{env}")
  })
}

export function mockFetchSourceFile(
  server: SetupServer,
  params: { path: string } & MockParams<Awaited<ReturnType<typeof fetchSourceFile>>>
) {
  return generateEndpointMock(server, {
    ...params,
    method: "get",
    path: getSourceUrl(`source/{env}/${params.path}`)
  })
}

export function mockPutSourceFile(
  server: SetupServer,
  params: { path: string } & MockParams<Awaited<ReturnType<typeof putSourceFile>>>
) {
  const { path, ...mockParams } = params
  return generateEndpointMock(server, {
    method: "put",
    path: getSourceUrl(`source/{env}/${path}`),
    ...mockParams
  })
}

export function mockFetchLibraryFile(
  server: SetupServer,
  params: { path: string } & MockParams<Awaited<ReturnType<typeof fetchLibraryFile>>>
) {
  return generateEndpointMock(server, {
    ...params,
    method: "get",
    path: `https://library.nosto.com/${params.path}`
  })
}

export function mockListDeployments(
  server: SetupServer,
  params: MockParams<Awaited<ReturnType<typeof listDeployments>>>
) {
  return generateEndpointMock(server, {
    ...params,
    method: "get",
    path: getSourceUrl("deployments/{env}")
  })
}

export function mockDeploy(
  server: SetupServer,
  params: { path: string } & MockParams<Awaited<ReturnType<typeof deploy>>>
) {
  const { path, ...mockParams } = params
  return generateEndpointMock(server, {
    method: "post",
    path: getSourceUrl(`deployments/{env}/${path}`),
    ...mockParams
  })
}

export function mockRedeploy(
  server: SetupServer,
  params: { deploymentId: string } & MockParams<Awaited<ReturnType<typeof redeploy>>>
) {
  const { deploymentId, ...mockParams } = params
  return generateEndpointMock(server, {
    method: "post",
    path: getSourceUrl(`deployment/{env}/${deploymentId}`),
    ...mockParams
  })
}

export function mockDisableDeployment(
  server: SetupServer,
  params: MockParams<Awaited<ReturnType<typeof disableDeployment>>>
) {
  return generateEndpointMock(server, {
    ...params,
    method: "delete",
    path: getSourceUrl("deployment/{env}")
  })
}
