import { describe, expect, it } from "vitest"

import { AuthConfigFilePath } from "#config/authConfig.ts"
import { loginToPlaycart } from "#modules/login.ts"
import { setupMockAuthServer } from "#test/utils/mockAuthServer.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()
const authServer = setupMockAuthServer()

describe("Login Module", () => {
  it("authenticates successfully", async () => {
    const authConfig = {
      user: "test-user",
      token: "test-token",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }

    authServer.mockValidResponse(authConfig)
    await loginToPlaycart()
    fs.expectFile(AuthConfigFilePath).toContain(JSON.stringify(authConfig, null, 2) + "\n")
  })

  it("throws on invalid response", async () => {
    authServer.mockGenericResponse({ url: "/?invalidParam=invalid" })
    await expect(loginToPlaycart()).rejects.toThrow(/Failed to parse playcart response/)
  })

  it("throws on empty url in response", async () => {
    authServer.mockGenericResponse({})
    await expect(loginToPlaycart()).rejects.toThrow(/Failed to parse playcart response/)
  })

  it("throws if unable to bind to a port", async () => {
    authServer.mockServerAddress(null)
    await expect(loginToPlaycart()).rejects.toThrow("Failed to get server address")
  })
})
