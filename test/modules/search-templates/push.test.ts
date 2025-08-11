import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { pushSearchTemplate } from "../../../src/modules/search-templates/push.ts"
import fs from "fs"

// Mock dependencies
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    statSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn()
  }
}))

vi.mock("../../../src/console/logger.ts", () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}))

vi.mock("../../../src/config/config.ts", () => ({
  getCachedConfig: vi.fn(() => ({
    projectPath: "/test/project",
    maxRequests: 5,
    merchant: "test-merchant",
    templatesEnv: "main",
    apiUrl: "https://api.nosto.com"
  }))
}))

vi.mock("../../../src/console/userPrompt.ts", () => ({
  promptForConfirmation: vi.fn()
}))

vi.mock("../../../src/api/source/putSourceFile.ts", () => ({
  putSourceFile: vi.fn()
}))

vi.mock("../../../src/filesystem/isIgnored.ts", () => ({
  isIgnored: vi.fn()
}))

describe("Push Search Template", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats)
    // Mock setTimeout to prevent real delays in tests
    vi.spyOn(global, "setTimeout").mockImplementation((fn: () => void) => {
      fn()
      return {} as NodeJS.Timeout
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("pushSearchTemplate", () => {
    it("should throw error if target folder does not exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      await expect(pushSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
        "Target folder does not exist"
      )
    })

    it("should throw error if target path is not a directory", async () => {
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as fs.Stats)

      await expect(pushSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
        "Target path is not a directory"
      )
    })

    it("should throw error if index.js does not exist", async () => {
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true) // target folder exists
        .mockReturnValueOnce(false) // index.js does not exist

      await expect(pushSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
        "Index file does not exist"
      )
    })

    it("should throw error if index.js does not contain @nosto/preact", async () => {
      vi.mocked(fs.readFileSync).mockReturnValue("some other content")

      await expect(pushSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
        "Index file does not contain @nosto/preact"
      )
    })

    it("should exit early if no files to push", async () => {
      const { Logger } = await import("../../../src/console/logger.ts")

      vi.mocked(fs.readFileSync).mockReturnValue("content with @nosto/preact")
      vi.mocked(fs.readdirSync).mockReturnValue([])

      await pushSearchTemplate({ paths: [], skipConfirmation: true })

      expect(Logger.warn).toHaveBeenCalledWith("No files to push. Exiting.")
    })

    it("should process files and display summary", async () => {
      const { Logger } = await import("../../../src/console/logger.ts")
      const { isIgnored } = await import("../../../src/filesystem/isIgnored.ts")
      const { putSourceFile } = await import("../../../src/api/source/putSourceFile.ts")

      vi.mocked(fs.readFileSync).mockReturnValue("content with @nosto/preact")
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: "file1.js", parentPath: "/test/project" },
        { name: "file2.js", parentPath: "/test/project/build" },
        { name: "ignored.log", parentPath: "/test/project" }
      ] as fs.Dirent[])
      vi.mocked(isIgnored)
        .mockReturnValueOnce(false) // file1.js not ignored
        .mockReturnValueOnce(false) // file2.js not ignored
        .mockReturnValueOnce(true) // ignored.log is ignored
      vi.mocked(putSourceFile).mockResolvedValue(undefined)

      await pushSearchTemplate({ paths: [], skipConfirmation: true })

      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Found 2 files to push"))
      expect(putSourceFile).toHaveBeenCalledTimes(2)
    })

    it("should prompt for confirmation when not skipped", async () => {
      const { promptForConfirmation } = await import("../../../src/console/userPrompt.ts")
      const { isIgnored } = await import("../../../src/filesystem/isIgnored.ts")

      vi.mocked(fs.readFileSync).mockReturnValue("content with @nosto/preact")
      vi.mocked(fs.readdirSync).mockReturnValue([{ name: "file1.js", parentPath: "/test/project" }] as fs.Dirent[])
      vi.mocked(isIgnored).mockReturnValue(false)
      vi.mocked(promptForConfirmation).mockResolvedValue(false)

      await pushSearchTemplate({ paths: [], skipConfirmation: false })

      expect(promptForConfirmation).toHaveBeenCalledWith(
        expect.stringContaining("Are you sure you want to push 1 files"),
        "N"
      )
    })

    it("should cancel operation when user declines", async () => {
      const { promptForConfirmation } = await import("../../../src/console/userPrompt.ts")
      const { Logger } = await import("../../../src/console/logger.ts")
      const { putSourceFile } = await import("../../../src/api/source/putSourceFile.ts")
      const { isIgnored } = await import("../../../src/filesystem/isIgnored.ts")

      vi.mocked(fs.readFileSync).mockReturnValue("content with @nosto/preact")
      vi.mocked(fs.readdirSync).mockReturnValue([{ name: "file1.js", parentPath: "/test/project" }] as fs.Dirent[])
      vi.mocked(isIgnored).mockReturnValue(false)
      vi.mocked(promptForConfirmation).mockResolvedValue(false)

      await pushSearchTemplate({ paths: [], skipConfirmation: false })

      expect(Logger.info).toHaveBeenCalledWith("Push operation cancelled by user.")
      expect(putSourceFile).not.toHaveBeenCalled()
    })

    it("should filter files by specified paths", async () => {
      const { putSourceFile } = await import("../../../src/api/source/putSourceFile.ts")
      const { isIgnored } = await import("../../../src/filesystem/isIgnored.ts")

      vi.mocked(fs.readFileSync).mockReturnValue("content with @nosto/preact")
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: "file1.js", parentPath: "/test/project" },
        { name: "file2.js", parentPath: "/test/project" },
        { name: "file3.js", parentPath: "/test/project" }
      ] as fs.Dirent[])
      vi.mocked(isIgnored).mockReturnValue(false)
      vi.mocked(putSourceFile).mockResolvedValue(undefined)

      await pushSearchTemplate({ paths: ["file1.js", "file3.js"], skipConfirmation: true })

      expect(putSourceFile).toHaveBeenCalledTimes(2)
      expect(putSourceFile).toHaveBeenCalledWith("file1.js", expect.any(String))
      expect(putSourceFile).toHaveBeenCalledWith("file3.js", expect.any(String))
    })

    it("should handle upload failures gracefully", async () => {
      const { putSourceFile } = await import("../../../src/api/source/putSourceFile.ts")
      const { isIgnored } = await import("../../../src/filesystem/isIgnored.ts")
      const { Logger } = await import("../../../src/console/logger.ts")

      vi.mocked(fs.readFileSync).mockReturnValue("content with @nosto/preact")
      vi.mocked(fs.readdirSync).mockReturnValue([{ name: "file1.js", parentPath: "/test/project" }] as fs.Dirent[])
      vi.mocked(isIgnored).mockReturnValue(false)

      // Mock the retry mechanism to fail quickly instead of waiting for real retries
      vi.mocked(putSourceFile).mockRejectedValue(new Error("Upload failed"))

      await pushSearchTemplate({ paths: [], skipConfirmation: true })

      expect(Logger.error).toHaveBeenCalledWith(
        expect.stringContaining("file1.js: Failed to push file1.js after 3 retries: Upload failed")
      )
    })
  })
})
