import { describe, expect } from "vitest"

import { putSourceFile } from "#api/source/putSourceFile.js"
import { mockFetchSourceFile, mockPutSourceFile, setupMockServer } from "#test/utils/mockServer.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"

const server = setupMockServer()

describe("putSourceFile", () => {
  it("sends the file content", async () => {
    const endpoint = mockPutSourceFile(server, { path: "test.txt" })

    await putSourceFile("test.txt", "file content")

    endpoint.expect.toHaveBeenCalled()
    endpoint.expect.toHaveBeenCalledWith("file content")
  })

  it("throws an error for status code 404", async () => {
    mockFetchSourceFile(server, { path: "test.txt", error: { status: 404, message: "Not Found" } })

    await expect(putSourceFile("test.txt", "file content")).rejects.toThrow()
  })

  it("returns early for a dry run", async () => {
    const endpoint = mockPutSourceFile(server, { path: "test.txt" })
    setupMockConfig({ dryRun: true })

    await putSourceFile("test.txt", "file content")

    endpoint.expect.not.toHaveBeenCalled()
  })
})
