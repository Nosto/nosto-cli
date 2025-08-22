import { describe, it } from "vitest"
import { pullSearchTemplate } from "#modules/search-templates/pull.ts"
import { mockFetchSourceFile, mockListSourceFiles, setupMockServer } from "#test/utils/mockServer.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()
const server = setupMockServer()
const terminal = setupMockConsole()

describe("Pull Search Template", () => {
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

    await pullSearchTemplate({ paths: [], force: true })
    fs.expectFile("index.js").toContain('"index.js content"')
    fs.expectFile("wizard.js").toContain('"wizard.js content"')
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

    await pullSearchTemplate({ paths: ["index.js"], force: true })

    fs.expectFile("index.js").toContain('"index.js content"')
    fs.expectFile("wizard.js").not.toExist()
  })

  it("should prompt for confirmation when files will be overridden", async () => {
    fs.writeFile("index.js", "old content")
    mockListSourceFiles(server, {
      response: [{ path: "index.js", size: 10 }]
    })
    mockFetchSourceFile(server, {
      path: "index.js",
      response: "index.js content"
    })

    terminal.setUserResponse("N")
    await pullSearchTemplate({ paths: [], force: false })
    terminal.expect.user.toHaveBeenPromptedWith("Are you sure you want to override your local data? (y/N):")
  })

  it("should cancel operation when user declines override", async () => {
    fs.writeFile("index.js", "old content")
    mockListSourceFiles(server, {
      response: [{ path: "index.js", size: 10 }]
    })

    terminal.setUserResponse("N")
    await pullSearchTemplate({ paths: [], force: false })
    fs.expectFile("/index.js").toContain("old content")
  })

  it("should proceed with download when user confirms override", async () => {
    fs.writeFile("index.js", "old content")
    mockListSourceFiles(server, {
      response: [{ path: "index.js", size: 10 }]
    })
    mockFetchSourceFile(server, {
      path: "index.js",
      response: "index.js content"
    })

    terminal.setUserResponse("Y")
    await pullSearchTemplate({ paths: [], force: false })
    fs.expectFile("index.js").toContain('"index.js content"')
  })
})
