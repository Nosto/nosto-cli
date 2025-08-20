import { type DefaultBodyType, http, HttpResponse } from "msw"
import type { SetupServer } from "msw/node"

type HttpMethod = keyof typeof http

export type MockParams<ResponseT extends DefaultBodyType> =
  | {
      response: ResponseT
    }
  | {
      error: { status: number; message: string }
    }
  | {}  // For void responses

export const generateEndpointMock = (
  server: SetupServer,
  { method, path, ...params }: { method: HttpMethod; path: string } & MockParams<DefaultBodyType>
) => {
  let invocations: { jsonBody: unknown }[] = []

  const handler = http[method](path, async ({ request }) => {
    invocations.push({
      jsonBody: request.method === "POST" || request.method === "PATCH" ? await request.json() : {}
    })

    const status = (() => {
      if ("error" in params) {
        return params.error.status
      } else if ("response" in params) {
        return 200
      }
      return 204
    })()

    const returnedResponse = (() => {
      if ("error" in params) {
        return params.error
      } else if ("response" in params) {
        return params.response
      }
      return undefined
    })()

    return HttpResponse.json(returnedResponse, { status })
  })
  server.use(handler)

  return {
    invocations,
    hasBeenCalled: () => invocations.length > 0,
    clearInvocations: () => (invocations = [])
  }
}
