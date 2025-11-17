import { describe, expect, it } from "vitest"

import { NotNostoTemplateError } from "#errors/NotNostoTemplateError.ts"
import { assertNostoTemplate } from "#filesystem/asserts/assertNostoTemplate.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()

describe("assertNostoTemplate", () => {
  it("throws error when target folder does not exist", () => {
    setupMockConfig({ projectPath: "/nonexistent" })

    expect(() => assertNostoTemplate()).toThrow(/Target folder does not exist/)
  })

  it("throws error when target path is not a directory", () => {
    setupMockConfig({ projectPath: "/file.txt" })
    fs.writeFile("/file.txt", "content")

    expect(() => assertNostoTemplate()).toThrow(/Target path is not a directory/)
  })

  it("returns early for modern template projects", () => {
    fs.writeFile("nosto.config.ts", "export default {}")

    expect(() => assertNostoTemplate()).not.toThrow()
  })

  it("throws NotNostoTemplateError when index.js does not exist in legacy project", () => {
    expect(() => assertNostoTemplate()).toThrow(NotNostoTemplateError)
    expect(() => assertNostoTemplate()).toThrow("Index file does not exist")
  })

  it("throws NotNostoTemplateError when index.js does not contain @nosto/preact", () => {
    fs.writeFile("index.js", "console.log('hello world')")

    expect(() => assertNostoTemplate()).toThrow(NotNostoTemplateError)
    expect(() => assertNostoTemplate()).toThrow("Index file does not contain @nosto/preact")
  })

  it("succeeds for valid legacy template project with @nosto/preact", () => {
    fs.writeFile("index.js", "import { render } from '@nosto/preact'")

    expect(() => assertNostoTemplate()).not.toThrow()
  })

  it("succeeds for legacy template project with @nosto/preact in require format", () => {
    fs.writeFile("index.js", "require('@nosto/preact')")

    expect(() => assertNostoTemplate()).not.toThrow()
  })
})
