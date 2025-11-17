import type { IncomingMessage, RequestListener, ServerResponse } from "node:http"
import { AddressInfo } from "node:net"

import { vi } from "vitest"

import { AuthConfig } from "#config/schema.ts"

// Mock the entire http module at the top level
let queuedServerRequest: Partial<IncomingMessage> | null = null
const queuedServerResponse = {
  writeHead: vi.fn(),
  end: vi.fn()
}

let mockedAddressFn: () => string | AddressInfo | null
export const mockHttpServer: {
  createServer: (listener: RequestListener) => unknown
} = {
  createServer: listener => {
    process.nextTick(() => {
      if (queuedServerRequest) {
        listener(queuedServerRequest as IncomingMessage, queuedServerResponse as unknown as ServerResponse)
        queuedServerRequest = null
      }
    })
    return {
      listen: (port: number, hostname?: string | (() => void), callback?: () => void) => {
        const actualCallback = typeof hostname === "function" ? hostname : callback
        if (actualCallback) {
          process.nextTick(actualCallback)
        }
        return {}
      },
      close: (callback?: () => void) => {
        if (callback) {
          process.nextTick(callback)
        }
      },
      address: () => {
        if (mockedAddressFn) {
          return mockedAddressFn()
        }
        return {
          port: 3000, // Mock port number
          address: "localhost",
          family: "IPv4"
        }
      }
    }
  }
}

export function setupMockAuthServer() {
  return {
    mockValidResponse: (res: AuthConfig) => {
      const params = new URLSearchParams({
        user: res.user,
        token: res.token,
        expiresAt: res.expiresAt.toISOString()
      })
      queuedServerRequest = {
        url: `/?${params.toString()}`
      }
    },
    mockGenericResponse: (res: Partial<IncomingMessage>) => {
      queuedServerRequest = res
    },
    mockServerAddress: (callback: string | AddressInfo | null) => {
      mockedAddressFn = () => callback
    }
  }
}
