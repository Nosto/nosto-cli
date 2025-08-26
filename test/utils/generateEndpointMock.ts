import { type DefaultBodyType, http, HttpResponse, StrictRequest } from "msw"
import type { SetupServer } from "msw/node"

type HttpMethod = keyof typeof http

export type MockParams<ResponseT extends DefaultBodyType | void> =
  | (ResponseT extends void ? object : { response: ResponseT })
  | {
      error: { status: number; message: string }
    }

export const generateEndpointMock = (
  server: SetupServer,
  { method, path, ...params }: { method: HttpMethod; path: string } & MockParams<DefaultBodyType>
) => {
  let invocations: unknown[] = []

  const handler = http[method](path, async ({ request }) => {
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

    const requestsWithBody = ["POST", "PUT", "PATCH"]
    invocations.push(requestsWithBody.includes(request.method) ? await toBody(request) : {})

    return HttpResponse.json(returnedResponse, { status })
  })
  server.use(handler)

  return {
    invocations,
    clearInvocations: () => {
      invocations = []
    }
  }
}

async function toBody(request: StrictRequest<DefaultBodyType>) {
  const text = await request.text()
  try {
    return JSON.parse(text)
  } catch {
    // Throwing here would trigger actual API request in test
  }
  return text
}
