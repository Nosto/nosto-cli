import { describe, expect, it } from "vitest"
import { listAllFiles, writeFile } from "#filesystem/filesystem.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"

const mockFileSystem = setupMockFileSystem()

describe("Filesystem", () => {
  it("should write file when not in dry run mode", () => {
    writeFile("file.txt", "content")
    mockFileSystem.expectFile("file.txt").toContain("content")
  })

  it("should not write file when in dry run mode", () => {
    setupMockConfig({ dryRun: true })

    writeFile("file.txt", "content")
    mockFileSystem.expectFile("file.txt").not.toExist()
  })

  it("should list all files", () => {
    mockFileSystem.writeFile("file1.txt", "content1")
    mockFileSystem.writeFile("file2.txt", "content2")
    expect(listAllFiles(".")).toEqual({
      allFiles: ["file1.txt", "file2.txt"],
      unfilteredFileCount: 2
    })
  })

  it("should list all files with project path", () => {
    setupMockConfig({ projectPath: "/test/folder" })
    mockFileSystem.writeFolder("/test/folder")
    mockFileSystem.writeFile("/test/folder/file1.txt", "content1")
    mockFileSystem.writeFile("/test/folder/file2.txt", "content2")

    const result = listAllFiles("/test/folder")

    expect(result).toEqual({
      allFiles: ["file1.txt", "file2.txt"],
      unfilteredFileCount: 2
    })
  })

  it("should not include folders in the list", () => {
    mockFileSystem.writeFile("subfolder/file1.txt", "content1")
    mockFileSystem.writeFile("other/subfolder/file2.txt", "content2")
    expect(listAllFiles(".")).toEqual({
      allFiles: ["subfolder/file1.txt", "other/subfolder/file2.txt"],
      unfilteredFileCount: 2
    })
  })
})
