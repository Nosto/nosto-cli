import { SetupServer } from "msw/node"
import { generateEndpointMock, MockParams } from "./generateEndpointMock.ts"
import { listSourceFiles } from "#api/source/listSourceFiles.ts"
import { getSourceUrl } from "#api/utils.ts"
import { fetchSourceFile } from "#api/source/fetchSourceFile.ts"

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
