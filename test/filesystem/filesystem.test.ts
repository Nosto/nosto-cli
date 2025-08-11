import { describe, it, expect, vi, beforeEach } from "vitest"
import fs from "fs"
import { writeFile } from "../../src/filesystem/filesystem.ts"

// Mock fs and config
vi.mock("fs")
vi.mock("../../src/config/config.ts", () => ({
  getCachedConfig: vi.fn(() => ({ dryRun: false }))
}))
vi.mock("../../src/console/logger.ts", () => ({
  Logger: { debug: vi.fn() }
}))

describe("Filesystem", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("writeFile", () => {
    it("should write file when not in dry run mode", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)

      writeFile("/test/file.txt", "content")

      expect(fs.writeFileSync).toHaveBeenCalledWith("/test/file.txt", "content")
    })
  })
})
