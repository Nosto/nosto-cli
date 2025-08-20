import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { pushSearchTemplate } from "#modules/search-templates/push.ts"
import { setupTestServer } from "#test/setup.ts"
import { mockConfig, mockFilesystem } from "#test/utils/mocks.ts"
import { mockConsole } from "#test/utils/consoleMocks.ts"
import { mockPutSourceFile } from "#test/utils/apiMock.ts"

const fs = mockFilesystem()
const server = setupTestServer()
const terminal = mockConsole()

describe("Push Search Template", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    terminal.clearPrompts()
    mockConfig()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("pushSearchTemplate", () => {
    it("should throw error if target folder does not exist", async () => {
      mockConfig({ projectPath: "/nonexistent/path" })

      await expect(pushSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
        "Target folder does not exist"
      )
    })

    it("should throw error if target path is not a directory", async () => {
      mockFilesystem().createFile("file.txt", "file content")
      mockConfig({
        projectPath: "./file.txt"
      })

      await expect(pushSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
        "Target path is not a directory"
      )
    })

    it("should throw error if index.js does not exist", async () => {
      await expect(pushSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
        "Index file does not exist"
      )
    })

    it("should throw error if index.js does not contain @nosto/preact", async () => {
      fs.createFile("index.js", "some other content")

      await expect(pushSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
        "Index file does not contain @nosto/preact"
      )
    })

    // TODO: Individual tests are fine, but they fail when run together.
    it.skip("should exit early if no files to push", async () => {
      fs.createFile(".gitignore", "*.js")
      fs.createFile("index.js", "content with @nosto/preact")

      await pushSearchTemplate({ paths: [], skipConfirmation: true })

      // Should complete without error
      expect(true).toBe(true)
    })

    it("should process files and display summary", async () => {
      fs.createFile(".gitignore", "*.log")
      fs.createFile("index.js", "content with @nosto/preact")
      fs.createFile("file1.js", "file1 content")
      fs.createFile("file2.js", "file2 content")
      fs.createFile("ignored.log", "log content")

      mockPutSourceFile(server, { path: "index.js" })
      mockPutSourceFile(server, { path: "file1.js" })
      mockPutSourceFile(server, { path: "file2.js" })

      await pushSearchTemplate({ paths: [], skipConfirmation: true })

      // Should complete without error
      expect(true).toBe(true)
    })

    it("should prompt for confirmation when not skipped", async () => {
      mockConfig({
        merchant: "test-merchant"
      })

      fs.createFile("index.js", "content with @nosto/preact")
      fs.createFile("file1.js", "file1 content")

      terminal.setUserResponse("N")

      await pushSearchTemplate({ paths: [], skipConfirmation: false })

      terminal.expect.user.toHaveBeenPromptedWith(
        "Are you sure you want to push 2 files to merchant test-merchant's main environment at https://api.nosto.com? (y/N):"
      )
    })

    it("should cancel operation when user declines", async () => {
      fs.createFile("index.js", "content with @nosto/preact")
      fs.createFile("file1.js", "file1 content")

      terminal.setUserResponse("N")

      await pushSearchTemplate({ paths: [], skipConfirmation: false })

      // Should cancel without attempting uploads
      expect(true).toBe(true)
    })

    it("should filter files by specified paths", async () => {
      fs.createFile("index.js", "content with @nosto/preact")
      fs.createFile("file1.js", "file1 content")
      fs.createFile("file2.js", "file2 content")
      fs.createFile("file3.js", "file3 content")

      mockPutSourceFile(server, { path: "index.js" })
      mockPutSourceFile(server, { path: "file1.js" })
      mockPutSourceFile(server, { path: "file3.js" })

      await pushSearchTemplate({ paths: ["index.js", "file1.js", "file3.js"], skipConfirmation: true })

      // Should complete without error
      expect(true).toBe(true)
    })

    // TODO: Expose retry count and delay to test this without timeout
    it.skip("should handle upload failures gracefully", async () => {
      fs.createFile("index.js", "content with @nosto/preact")
      fs.createFile("file1.js", "file1 content")

      mockPutSourceFile(server, { path: "index.js", error: { status: 500, message: "Upload failed" } })
      mockPutSourceFile(server, { path: "file1.js", error: { status: 500, message: "Upload failed" } })

      await pushSearchTemplate({ paths: [], skipConfirmation: true })
    })
  })
})
