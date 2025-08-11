import { describe, it, expect, vi, beforeEach } from "vitest"
import { pullSearchTemplate } from "../../../src/modules/search-templates/pull.ts"
import fs from "fs"

// Mock dependencies
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    statSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn()
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
    maxRequests: 5
  }))
}))

vi.mock("../../../src/console/userPrompt.ts", () => ({
  promptForConfirmation: vi.fn()
}))

vi.mock("../../../src/api/source/listSourceFiles.ts", () => ({
  listSourceFiles: vi.fn()
}))

vi.mock("../../../src/api/retry.ts", () => ({
  fetchWithRetry: vi.fn()
}))

vi.mock("../../../src/filesystem/filesystem.ts", () => ({
  writeFile: vi.fn()
}))

describe("Pull Search Template", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats)
  })

  describe("pullSearchTemplate", () => {
    it("should throw error if target folder does not exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      await expect(pullSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
        "Target folder does not exist"
      )
    })

    it("should throw error if target path is not a directory", async () => {
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as fs.Stats)

      await expect(pullSearchTemplate({ paths: [], skipConfirmation: true })).rejects.toThrow(
        "Target path is not a directory"
      )
    })

    it("should fetch all files when no paths specified", async () => {
      const { listSourceFiles } = await import("../../../src/api/source/listSourceFiles.ts")
      const { fetchWithRetry } = await import("../../../src/api/retry.ts")
      const { Logger } = await import("../../../src/console/logger.ts")

      const mockFiles = [{ path: "file1.js" }, { path: "file2.js" }]

      vi.mocked(listSourceFiles).mockResolvedValue(mockFiles)
      vi.mocked(fetchWithRetry).mockResolvedValue("file content")

      await pullSearchTemplate({ paths: [], skipConfirmation: true })

      expect(listSourceFiles).toHaveBeenCalled()
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Found 2 source files"))
      expect(fetchWithRetry).toHaveBeenCalledTimes(2)
    })

    it("should filter files by specified paths", async () => {
      const { listSourceFiles } = await import("../../../src/api/source/listSourceFiles.ts")
      const { fetchWithRetry } = await import("../../../src/api/retry.ts")

      const mockFiles = [{ path: "file1.js" }, { path: "file2.js" }, { path: "file3.js" }]

      vi.mocked(listSourceFiles).mockResolvedValue(mockFiles)
      vi.mocked(fetchWithRetry).mockResolvedValue("file content")

      await pullSearchTemplate({ paths: ["file1.js", "file3.js"], skipConfirmation: true })

      expect(fetchWithRetry).toHaveBeenCalledTimes(2)
      expect(fetchWithRetry).toHaveBeenCalledWith(expect.any(Function), "file1.js")
      expect(fetchWithRetry).toHaveBeenCalledWith(expect.any(Function), "file3.js")
    })

    it("should prompt for confirmation when files will be overridden", async () => {
      const { listSourceFiles } = await import("../../../src/api/source/listSourceFiles.ts")
      const { promptForConfirmation } = await import("../../../src/console/userPrompt.ts")
      const { Logger } = await import("../../../src/console/logger.ts")

      const mockFiles = [{ path: "file1.js" }]
      vi.mocked(listSourceFiles).mockResolvedValue(mockFiles)
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true) // target directory exists
        .mockReturnValueOnce(true) // file exists (will be overridden)
      vi.mocked(promptForConfirmation).mockResolvedValue(false)

      await pullSearchTemplate({ paths: [], skipConfirmation: false })

      expect(Logger.warn).toHaveBeenCalledWith(expect.stringContaining("1 files will be overridden"))
      expect(promptForConfirmation).toHaveBeenCalledWith("Are you sure you want to override your local data?", "N")
    })

    it("should cancel operation when user declines override", async () => {
      const { listSourceFiles } = await import("../../../src/api/source/listSourceFiles.ts")
      const { promptForConfirmation } = await import("../../../src/console/userPrompt.ts")
      const { fetchWithRetry } = await import("../../../src/api/retry.ts")
      const { Logger } = await import("../../../src/console/logger.ts")

      const mockFiles = [{ path: "file1.js" }]
      vi.mocked(listSourceFiles).mockResolvedValue(mockFiles)
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true) // target directory exists
        .mockReturnValueOnce(true) // file exists (will be overridden)
      vi.mocked(promptForConfirmation).mockResolvedValue(false)

      await pullSearchTemplate({ paths: [], skipConfirmation: false })

      expect(Logger.info).toHaveBeenCalledWith("Operation cancelled by user")
      expect(fetchWithRetry).not.toHaveBeenCalled()
    })

    it("should proceed with download when user confirms override", async () => {
      const { listSourceFiles } = await import("../../../src/api/source/listSourceFiles.ts")
      const { promptForConfirmation } = await import("../../../src/console/userPrompt.ts")
      const { fetchWithRetry } = await import("../../../src/api/retry.ts")

      const mockFiles = [{ path: "file1.js" }]
      vi.mocked(listSourceFiles).mockResolvedValue(mockFiles)
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true) // target directory exists
        .mockReturnValueOnce(true) // file exists (will be overridden)
      vi.mocked(promptForConfirmation).mockResolvedValue(true)
      vi.mocked(fetchWithRetry).mockResolvedValue("file content")

      await pullSearchTemplate({ paths: [], skipConfirmation: false })

      expect(fetchWithRetry).toHaveBeenCalledTimes(1)
    })
  })
})
