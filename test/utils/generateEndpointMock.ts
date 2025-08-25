import { type DefaultBodyType, http, HttpResponse, StrictRequest } from "msw"
import type { SetupServer } from "msw/node"
import { expect } from "vitest"

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
    expect: {
      toHaveBeenCalled: () => {
        expect(invocations.length, "The endpoint has not been called").toBeGreaterThan(0)
      },
      toHaveBeenCalledWith: (jsonBody: unknown) => {
        expect(
          invocations.some(invocation => JSON.stringify(invocation) === JSON.stringify(jsonBody)),
          "No invocation parameter matched the pattern"
        ).toBe(true)
      },
      not: {
        toHaveBeenCalled: () => {
          expect(invocations.length, "The endpoint has been called").toBe(0)
        }
      }
    },
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
