import { describe, expect, it } from "vitest"

import { pullSearchTemplate } from "#modules/search-templates/pull.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { mockFetchSourceFile, mockListSourceFiles, setupMockServer } from "#test/utils/mockServer.ts"

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

  it("should copy the hash as the new last seen hash", async () => {
    mockListSourceFiles(server, {
      response: []
    })
    fs.writeFile("build/hash", "123")

    await pullSearchTemplate({ paths: [], force: true })
    fs.expectFile(".nostocache/hash").toContain("123")
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
    expect(terminal.getSpy("warn")).toHaveBeenCalledWith(expect.stringContaining("index.js"))
  })

  it("should prompt for confirmation when many files will be overridden", async () => {
    const files = Array.from({ length: 15 }, (_, i) => {
      fs.writeFile(`file${i}.js`, "old content")
      return { path: `file${i}.js`, size: 10 }
    })
    mockListSourceFiles(server, {
      response: files
    })

    terminal.setUserResponse("N")
    await pullSearchTemplate({ paths: [], force: false })
    expect(terminal.getSpy("warn")).toHaveBeenCalledWith(expect.stringContaining("and 5 more"))
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

  it("should abort if the remote template is already up to date", async () => {
    fs.writeFile("index.js", "old content")
    mockFetchSourceFile(server, {
      path: "build/hash",
      response: "34a780ad578b997db55b260beb60b501f3e04d30ba1a51fcf43cd8dd1241780d",
      contentType: "raw"
    })

    await pullSearchTemplate({ paths: [], force: false })
    expect(terminal.getSpy("success")).toHaveBeenCalledWith("Local template is already up to date.")
  })
})
