import { describe, expect, it } from "vitest"

import { parseAuthFile } from "#config/authConfig.ts"
import { AuthConfig } from "#config/schema.ts"
import { MissingConfigurationError } from "#errors/MissingConfigurationError.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()

describe("Auth Config", () => {
  it("should throw if auth file does not exist", () => {
    expect(() => parseAuthFile({})).toThrowError(MissingConfigurationError)
    expect(() => parseAuthFile({ allowIncomplete: false })).toThrowError(MissingConfigurationError)
  })

  it("with allowIncomplete, should return empty auth config if auth file does not exist", () => {
    const authConfig = parseAuthFile({ allowIncomplete: true })
    expect(authConfig).toEqual({ user: "", token: "", expiresAt: new Date(0) })
  })

  it("should parse a valid auth file", () => {
    const config = {
      user: "testuser@nosto.com",
      token: "testtoken",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60)
    } satisfies AuthConfig

    fs.writeFile(fs.paths.authFile, config)

    const authConfig = parseAuthFile({})
    expect(authConfig).toEqual(config)
  })

  it("should throw an error for invalid auth file JSON", () => {
    fs.writeFile(fs.paths.authFile, "{ invalidJson: true ")

    expect(() => parseAuthFile({})).toThrowError(/Invalid JSON in auth file/)
  })

  it("should throw an error for auth file with invalid schema", () => {
    const invalidConfig = {
      user: ""
    }

    fs.writeFile(fs.paths.authFile, invalidConfig)

    expect(() => parseAuthFile({})).toThrowError(/Invalid auth file/)
  })

  it("should throw an error for a malformed file", () => {
    fs.writeFile(fs.paths.authFile, "\xff\xfe\xff\xfe")

    expect(() => parseAuthFile({})).toThrowError(/Unexpected token/)
  })

  it("should throw an error when filesystem throws", () => {
    fs.writeFile(fs.paths.authFile, {})
    fs.chmod(fs.paths.authFile, 0o000) // Remove all permissions

    expect(() => parseAuthFile({})).toThrowError(/permission denied/)
  })
})
