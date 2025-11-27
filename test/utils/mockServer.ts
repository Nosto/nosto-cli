import { SetupServer, setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest"

// Deployment API functions (imported for ReturnType type inference)
import { createDeployment } from "#api/deployments/createDeployment.ts"
import { listDeployments } from "#api/deployments/listDeployments.ts"
import { rollbackDeployment } from "#api/deployments/rollbackDeployment.ts"
import { updateDeployment } from "#api/deployments/updateDeployment.ts"
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

export function mockCreateDeployment(
  server: SetupServer,
  params: { path: string } & MockParams<Awaited<ReturnType<typeof createDeployment>>>
) {
  const { path, ...mockParams } = params
  return generateEndpointMock(server, {
    method: "post",
    path: getSourceUrl(`deployments/{env}/${path}`),
    ...mockParams
  })
}

export function mockUpdateDeployment(
  server: SetupServer,
  params: { deploymentId: string } & MockParams<Awaited<ReturnType<typeof updateDeployment>>>
) {
  const { deploymentId, ...mockParams } = params
  return generateEndpointMock(server, {
    method: "post",
    path: getSourceUrl(`deployment/{env}/${deploymentId}`),
    ...mockParams
  })
}

export function mockRollbackDeployment(
  server: SetupServer,
  params: MockParams<Awaited<ReturnType<typeof rollbackDeployment>>>
) {
  return generateEndpointMock(server, {
    ...params,
    method: "delete",
    path: getSourceUrl("deployment/{env}")
  })
}
