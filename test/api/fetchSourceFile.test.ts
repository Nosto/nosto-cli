import { describe, expect } from "vitest"

import { fetchSourceFileIfExists } from "#api/source/fetchSourceFile.js"
import { mockFetchSourceFile, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()

describe("fetchSourceFileIfExists", () => {
  it("fetches the file if exists", async () => {
    mockFetchSourceFile(server, { path: "test.txt", response: "file content" })

    const file = await fetchSourceFileIfExists("test.txt")

    expect(file).toBe('"file content"')
  })

  it("returns null if server returns 404", async () => {
    mockFetchSourceFile(server, { path: "test.txt", error: { status: 404, message: "Not Found" } })

    const file = await fetchSourceFileIfExists("test.txt")

    expect(file).toBe(null)
  })

  it("throws an error for status code 500", async () => {
    mockFetchSourceFile(server, { path: "test.txt", error: { status: 500, message: "Server Error" } })

    await expect(fetchSourceFileIfExists("test.txt")).rejects.toThrow()
  })
})
