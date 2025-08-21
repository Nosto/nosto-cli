import { describe, it, expect } from "vitest"
import { pushSearchTemplate } from "#modules/search-templates/push.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { mockPutSourceFile, setupMockServer } from "#test/utils/mockServer.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const fs = setupMockFileSystem()
const server = setupMockServer()
const terminal = setupMockConsole()

describe("Push Search Template", () => {
  it("should throw error if target folder does not exist", async () => {
    setupMockConfig({ projectPath: "/nonexistent/path" })

    await expect(pushSearchTemplate({ paths: [], force: true })).rejects.toThrow(
      "ENOENT: no such file or directory, scandir '/nonexistent/path'"
    )
  })

  it("should throw error if target path is not a directory", async () => {
    fs.writeFile("file.txt", "file content")
    setupMockConfig({
      projectPath: "./file.txt"
    })

    await expect(pushSearchTemplate({ paths: [], force: true })).rejects.toThrow(
      "ENOTDIR: not a directory, scandir '/file.txt'"
    )
  })

  it("should exit early if no files to push", async () => {
    fs.writeFile(".gitignore", "*.js")
    fs.writeFile("index.js", "content with @nosto/preact")

    await pushSearchTemplate({ paths: [], force: true })

    expect(terminal.getSpy("warn")).toHaveBeenCalledWith("No files to push. Exiting.")
  })

  it("should process files and display summary", async () => {
    fs.writeFile(".gitignore", "*.log")
    fs.writeFile("index.js", "content with @nosto/preact")
    fs.writeFile("file1.js", "file1 content")
    fs.writeFile("file2.js", "file2 content")
    fs.writeFile("ignored.log", "log content")

    mockPutSourceFile(server, { path: "index.js" })
    mockPutSourceFile(server, { path: "file1.js" })
    mockPutSourceFile(server, { path: "file2.js" })

    await pushSearchTemplate({ paths: [], force: true })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Pushing template from: /")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Found 4 files to push (3 source, 1 built, 1 ignored).")
  })

  it("should cancel operation when user declines", async () => {
    fs.writeFile("index.js", "content with @nosto/preact")
    fs.writeFile("file1.js", "file1 content")

    terminal.setUserResponse("N")

    await pushSearchTemplate({ paths: [], force: false })
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Push operation cancelled by user.")
  })

  it("should filter files by specified paths", async () => {
    fs.writeFile("index.js", "content with @nosto/preact")
    fs.writeFile("file1.js", "file1 content")
    fs.writeFile("file2.js", "file2 content")
    fs.writeFile("file3.js", "file3 content")

    mockPutSourceFile(server, { path: "index.js" })
    mockPutSourceFile(server, { path: "file1.js" })
    mockPutSourceFile(server, { path: "file3.js" })

    await pushSearchTemplate({ paths: ["index.js", "file1.js", "file3.js"], force: true })
    expect(terminal.getSpy("warn")).not.toHaveBeenCalledWith("No files to push. Exiting.")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Pushing template from: /")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Found 4 files to push (3 source, 1 built, 0 ignored).")
  })

  // TODO: Times out because of retry delay. Should be configurable in tests.
  it.skip("should handle upload failures gracefully", async () => {
    fs.writeFile("index.js", "content with @nosto/preact")
    fs.writeFile("file1.js", "file1 content")

    mockPutSourceFile(server, { path: "index.js", error: { status: 500, message: "Upload failed" } })
    mockPutSourceFile(server, { path: "file1.js", error: { status: 500, message: "Upload failed" } })

    await pushSearchTemplate({ paths: [], force: true })
  })
})
