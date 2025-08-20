import { describe, it, expect, vi, beforeEach } from "vitest"
import fs from "fs"
import { writeFile } from "#filesystem/filesystem.ts"

vi.mock("fs")

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
