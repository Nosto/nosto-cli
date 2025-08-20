import { describe, it, expect, vi, beforeEach } from "vitest"
import { pullSearchTemplate } from "#modules/search-templates/pull.ts"
import { setupTestServer } from "#test/setup.ts"
import { mockConfig, mockFilesystem } from "#test/utils/mocks.ts"
import { mockConsole } from "#test/utils/consoleMocks.ts"
import { mockFetchSourceFile, mockListSourceFiles } from "#test/utils/apiMock.ts"

const fs = mockFilesystem()
const server = setupTestServer()
const terminal = mockConsole()

describe("Pull Search Template", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("should throw error if target folder does not exist", async () => {
    mockConfig({
      projectPath: "./folder"
    })

    await expect(pullSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
      "Target folder does not exist"
    )
  })

  it("should throw error if target path is not a directory", async () => {
    mockFilesystem().createFile("file.txt", "file content")
    mockConfig({
      projectPath: "./file.txt"
    })

    await expect(pullSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
      "Target path is not a directory"
    )
  })

  it("should fetch all files when no paths specified", async () => {
    mockListSourceFiles(server, {
      response: [
        { path: "index.js", size: 10 },
        { path: "wizard.js", size: 25 }
      ]
    })
    mockFetchSourceFile(server, {
      path: "index.js",
      response: "index.js content"
    })
    mockFetchSourceFile(server, {
      path: "wizard.js",
      response: "wizard.js content"
    })

    await pullSearchTemplate({ paths: [], skipConfirmation: true })
    fs.expectFile("index.js").toHaveContent('"index.js content"')
    fs.expectFile("wizard.js").toHaveContent('"wizard.js content"')
  })

  it("should filter by specified paths", async () => {
    mockListSourceFiles(server, {
      response: [
        { path: "index.js", size: 10 },
        { path: "wizard.js", size: 25 }
      ]
    })
    mockFetchSourceFile(server, {
      path: "index.js",
      response: "index.js content"
    })
    mockFetchSourceFile(server, {
      path: "wizard.js",
      response: "wizard.js content"
    })

    await pullSearchTemplate({ paths: ["index.js"], skipConfirmation: true })

    fs.expectFile("/index.js").toHaveContent('"index.js content"')
    fs.expectFile("/wizard.js").not.toExist()
  })

  it("should prompt for confirmation when files will be overridden", async () => {
    fs.createFile("index.js", "old content")
    mockListSourceFiles(server, {
      response: [{ path: "index.js", size: 10 }]
    })
    mockFetchSourceFile(server, {
      path: "index.js",
      response: "index.js content"
    })

    terminal.setUserResponse("N")
    await pullSearchTemplate({ paths: [], skipConfirmation: false })
    terminal.expect.user.toHaveBeenPromptedWith("Are you sure you want to override your local data? (y/N):")
  })

  it("should cancel operation when user declines override", async () => {
    fs.createFile("index.js", "old content")
    mockListSourceFiles(server, {
      response: [{ path: "index.js", size: 10 }]
    })

    terminal.setUserResponse("N")
    await pullSearchTemplate({ paths: [], skipConfirmation: false })
    fs.expectFile("/index.js").toHaveContent("old content")
  })

  it("should proceed with download when user confirms override", async () => {
    fs.createFile("index.js", "old content")
    mockListSourceFiles(server, {
      response: [{ path: "index.js", size: 10 }]
    })
    mockFetchSourceFile(server, {
      path: "index.js",
      response: "index.js content"
    })

    terminal.setUserResponse("Y")
    await pullSearchTemplate({ paths: [], skipConfirmation: false })
    fs.expectFile("/index.js").toHaveContent('"index.js content"')
  })
})
