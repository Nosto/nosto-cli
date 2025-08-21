import { expect } from "vitest"
import fs from "fs"
import path from "path"
import { testVolume } from "#test/setup.ts"

export function setupMockFileSystem() {
  const fs = testVolume
  return {
    createFile: (targetFile: string, content: string) => {
      const dir = path.join("/", targetFile.substring(0, targetFile.lastIndexOf("/")))
      const filePath = path.join("/", targetFile)
      // Ensure parent directory exists
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      fs.writeFileSync(filePath, content)
    },
    expectFile: (targetFile: string) => {
      const filePath = path.join("/", targetFile)
      return makeFileMatcher(filePath)
    }
  }
}

export function makeFileMatcher(path: string) {
  return {
    toHaveContent: (expectedContent: string) => {
      const content = fs.readFileSync(path, "utf8")
      expect(content, `File ${path} has content ${content}`).toEqual(expectedContent)
    },
    toExist: () => {
      return expect(fs.existsSync(path), `File ${path} does not exist when it was expected to`).toBe(true)
    },
    not: {
      toHaveContent: (expectedContent: string) => {
        const content = fs.readFileSync(path, "utf8")
        expect(content, `File ${path} has content ${content}`).not.toEqual(expectedContent)
      },
      toExist: () => {
        return expect(fs.existsSync(path), `File ${path} exists when it was not expected to`).toBe(false)
      }
    }
  }
}
