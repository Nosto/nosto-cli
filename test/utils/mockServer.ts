import { setupServer, SetupServer } from "msw/node"
import { generateEndpointMock, MockParams } from "#test/utils/generateEndpointMock.ts"
import { listSourceFiles } from "#api/source/listSourceFiles.ts"
import { getSourceUrl } from "#api/utils.ts"
import { fetchSourceFile } from "#api/source/fetchSourceFile.ts"
import { putSourceFile } from "#api/source/putSourceFile.ts"
import { fetchLibraryFile } from "#api/library/fetchLibraryFile.ts"
import { beforeAll, afterEach, afterAll, beforeEach } from "vitest"

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
