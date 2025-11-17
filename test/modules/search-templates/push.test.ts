import { describe, expect, it } from "vitest"

import { pushSearchTemplate } from "#modules/search-templates/push.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { mockFetchSourceFile, mockPutSourceFile, setupMockServer } from "#test/utils/mockServer.ts"

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

  it("should not ignore build directory", async () => {
    fs.writeFile(".gitignore", "build/")
    fs.writeFile("index.js", "content with @nosto/preact")
    fs.writeFile("build/index.js", "build content")

    mockPutSourceFile(server, { path: "index.js" })
    mockPutSourceFile(server, { path: "build/index.js" })

    await pushSearchTemplate({ paths: [], force: true })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Pushing template from: /")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Found 3 files to push (1 source, 2 built, 0 ignored).")
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

  it("should abort if remote template is already up to date", async () => {
    fs.writeFile("index.js", "old content")
    mockFetchSourceFile(server, {
      path: "build/hash",
      response: "34a780ad578b997db55b260beb60b501f3e04d30ba1a51fcf43cd8dd1241780d",
      contentType: "raw"
    })

    await pushSearchTemplate({ paths: [], force: false })
    expect(terminal.getSpy("success")).toHaveBeenCalledWith("Remote template is already up to date.")
    fs.expectFile("/.nostocache/hash").toContain("34a780ad578b997db55b260beb60b501f3e04d30ba1a51fcf43cd8dd1241780d")
  })

  it("should skip prompt when remote and last seen hashes match", async () => {
    fs.writeFile("index.js", "content with @nosto/preact")
    fs.writeFile(".nostocache/hash", "matching-hash")

    mockFetchSourceFile(server, {
      path: "build/hash",
      response: "matching-hash",
      contentType: "raw"
    })
    mockPutSourceFile(server, { path: "index.js" })
    mockPutSourceFile(server, { path: "build/hash" })

    await pushSearchTemplate({ paths: [], force: false })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Pushing template from: /")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Found 2 files to push (1 source, 1 built, 0 ignored).")
  })

  it("should handle build/hash file already existing", async () => {
    fs.writeFile("index.js", "content with @nosto/preact")
    fs.writeFile(".nostocache/hash", "matching-hash")
    fs.writeFile("build/hash", "matching-hash")

    mockFetchSourceFile(server, {
      path: "build/hash",
      response: "matching-hash",
      contentType: "raw"
    })
    mockPutSourceFile(server, { path: "index.js" })
    mockPutSourceFile(server, { path: "build/hash" })

    await pushSearchTemplate({ paths: [], force: false })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Pushing template from: /")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Found 2 files to push (1 source, 1 built, 1 ignored).")
  })

  it("should prompt for confirmation when remote hash exists but no last seen hash", async () => {
    fs.writeFile("index.js", "content with @nosto/preact")

    mockFetchSourceFile(server, {
      path: "build/hash",
      response: "remote-hash",
      contentType: "raw"
    })
    mockPutSourceFile(server, { path: "index.js" })
    mockPutSourceFile(server, { path: "build/hash" })

    terminal.setUserResponse("y")

    await pushSearchTemplate({ paths: [], force: false })

    terminal.expect.user.toHaveBeenPromptedWith(
      "It seems that this is the first time you are pushing to this environment. Please make sure your local copy is up to date. Continue? (y/N):"
    )
  })

  it("should prompt for confirmation when remote hash differs from last seen hash", async () => {
    fs.writeFile("index.js", "content with @nosto/preact")
    fs.writeFile(".nostocache/hash", "old-hash")

    mockFetchSourceFile(server, {
      path: "build/hash",
      response: "different-remote-hash",
      contentType: "raw"
    })
    mockPutSourceFile(server, { path: "index.js" })
    mockPutSourceFile(server, { path: "build/hash" })

    terminal.setUserResponse("y")

    await pushSearchTemplate({ paths: [], force: false })

    terminal.expect.user.toHaveBeenPromptedWith(
      "It seems that the template has been changed since your last push. Are you sure you want to continue? (y/N):"
    )
  })

  it("should prompt for confirmation when no remote hash exists", async () => {
    fs.writeFile("index.js", "content with @nosto/preact")
    fs.writeFile(".nostocache/hash", "some-hash")

    mockFetchSourceFile(server, {
      path: "build/hash",
      error: { status: 404, message: "Not Found" }
    })
    mockPutSourceFile(server, { path: "index.js" })
    mockPutSourceFile(server, { path: "build/hash" })

    terminal.setUserResponse("y")

    await pushSearchTemplate({ paths: [], force: false })

    terminal.expect.user.toHaveBeenPromptedWith(
      "It seems that this is the first time you are pushing to this environment. Please make sure your local copy is up to date. Continue? (y/N):"
    )
  })

  it("should cancel operation when user declines prompt for first-time push", async () => {
    fs.writeFile("index.js", "content with @nosto/preact")

    mockFetchSourceFile(server, {
      path: "build/hash",
      response: "remote-hash",
      contentType: "raw"
    })

    terminal.setUserResponse("N")

    await pushSearchTemplate({ paths: [], force: false })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Push operation cancelled by user.")
  })

  it("should cancel operation when user declines prompt for conflicting changes", async () => {
    fs.writeFile("index.js", "content with @nosto/preact")
    fs.writeFile(".nostocache/hash", "old-hash")

    mockFetchSourceFile(server, {
      path: "build/hash",
      response: "different-remote-hash",
      contentType: "raw"
    })

    terminal.setUserResponse("N")

    await pushSearchTemplate({ paths: [], force: false })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Push operation cancelled by user.")
  })
})
