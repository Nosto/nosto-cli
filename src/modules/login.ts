import http from "node:http"

import open from "open"
import z from "zod"

import { AuthConfigFilePath } from "#config/authConfig.ts"
import { getCachedConfig } from "#config/config.ts"
import { AuthConfigSchema } from "#config/schema.ts"
import { Logger } from "#console/logger.ts"
import { InvalidLoginResponseError } from "#errors/InvalidLoginResponseError.ts"
import { withErrorHandler } from "#errors/withErrorHandler.ts"
import { writeFile } from "#filesystem/filesystem.ts"

/**
 * Playcart authentication flow works roughly as follows:
 * - Internal web server is created by the CLI, listening on an ephemeral port
 * - Browser page is opened to the Nosto login page with a redirect URI to localhost
 * - After successful login (with 2FA), the redirect will hit the internal server
 * - The response parameters are parsed from the query parameters
 */
export async function loginToPlaycart() {
  const server = await createAuthServer()
  const config = getCachedConfig()
  const redirectUri = `http://localhost:${server.port}`
  const adminUrl = config.apiUrl.replace("://api.", "://my.").replace("/api", "")
  const loginUrl = `${adminUrl}/admin/cli/redirect?target=${encodeURIComponent(redirectUri)}`

  await open(loginUrl)

  Logger.info("Awaiting response from the browser...")
  const response = await server.responseData
  writeFile(AuthConfigFilePath, JSON.stringify(response, null, 2) + "\n")

  Logger.success(`Login successful! Auth file saved at ${AuthConfigFilePath}`)
}

type AuthServer = {
  port: number
  responseData: Promise<PlaycartResponse>
}

type PlaycartResponse = z.infer<typeof AuthConfigSchema>

/**
 * The authentication server is created to handle a single redirect from the browser.
 */
async function createAuthServer(): Promise<AuthServer> {
  const { promise: tokenPromise, resolve: resolveTokenPromise } = Promise.withResolvers<PlaycartResponse>()

  function handleRequest(res: http.ServerResponse, req: http.IncomingMessage) {
    res.writeHead(200, { "content-type": "text/plain", connection: "close" })
    res.end("You can now close this page and return to the CLI.\n")

    const url = new URL(req.url ?? "", "http://localhost")
    const parsed = AuthConfigSchema.safeParse({
      user: url.searchParams.get("user"),
      token: url.searchParams.get("token"),
      expiresAt: url.searchParams.get("expiresAt")
    })
    if (!parsed.success) {
      throw new InvalidLoginResponseError(`Failed to parse playcart response: ${parsed.error.message}`)
    }
    resolveTokenPromise(parsed.data)
  }

  const server = http.createServer((req, res) => {
    withErrorHandler(() => {
      handleRequest(res, req)
    })
    server.close()
  })

  const port = await new Promise<number>(resolve => {
    server.listen(0, "localhost", () => {
      const addr = server.address()
      if (!addr || typeof addr !== "object") {
        throw new Error("Failed to get server address")
      }
      resolve(addr.port)
    })
  })

  return {
    port,
    responseData: tokenPromise
  }
}
