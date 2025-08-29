import http from "node:http"

import open from "open"

import { AuthConfigFilePath } from "#config/authConfig.ts"
import { type AuthConfig } from "#config/schema.ts"
import { Logger } from "#console/logger.ts"
import { writeFile } from "#filesystem/filesystem.ts"

export async function loginToPlaycart() {
  Logger.debug(`Starting login server`)
  const server = await createAuthServer()
  const redirectUri = `http://localhost:${server.port}`
  Logger.debug(`Login server started on port ${server.port}, redirect URI: ${redirectUri}`)
  const loginUrl = `https://my.dev.nos.to/admin/dev/redirect?target=${encodeURIComponent(redirectUri)}`
  Logger.debug(`Opening browser to ${loginUrl}`)
  await open(loginUrl)
  Logger.info("Awaiting response from the browser...")
  const response = await server.getResponseData()
  const tokenData = {
    user: response.user,
    authToken: response.token,
    authExpiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
  } satisfies AuthConfig
  writeFile(AuthConfigFilePath, JSON.stringify(tokenData, null, 2))
  Logger.success(`Login successful! Auth file saved at ${AuthConfigFilePath}`)
}

type PlaycartResponse = {
  user: string
  token: string
}

type AuthServer = {
  port: number
  getResponseData: () => Promise<PlaycartResponse>
}

async function createAuthServer(): Promise<AuthServer> {
  const { promise: tokenPromise, resolve: resolveTokenPromise } = Promise.withResolvers<PlaycartResponse>()
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/plain", connection: "close" })
    res.end("You can now close this page and return to the CLI.\n")
    server.close()
    if (!req.url) {
      Logger.error("No URL provided in callback")
      throw new Error("No URL provided in callback")
    }
    const params = req.url.split("?")[1].split("&")
    const user = params.find(p => p.includes("user="))?.split("user=")[1]
    const token = params.find(p => p.includes("token="))?.split("token=")[1]
    if (!user) {
      Logger.error("No user provided in callback URL: " + req.url)
      throw new Error("No user provided in callback URL")
    }
    if (!token) {
      Logger.error("No token provided in callback URL: " + req.url)
      throw new Error("No token provided in callback URL")
    }
    resolveTokenPromise({
      user: decodeURIComponent(user),
      token: decodeURIComponent(token)
    })
  })
  server.maxConnections = 1
  server.keepAliveTimeout = 1
  const startupPromise = new Promise<number>(resolve => {
    server.listen(0, "localhost", () => {
      const addr = server.address()
      if (!addr || typeof addr !== "object") {
        throw new Error("Failed to get server address")
      }
      resolve(addr.port)
    })
  })
  const port = await startupPromise
  return {
    port,
    getResponseData: () => {
      return tokenPromise
    }
  }
}
