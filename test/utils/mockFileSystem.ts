import fs from "fs"
import path from "path"
import { expect } from "vitest"

import { getDefaultConfig } from "#config/config.ts"
import { PersistentConfig } from "#config/schema.ts"
import { HomeDirectory } from "#filesystem/homeDirectory.ts"
import { testVolume } from "#test/setup.ts"

export function setupMockFileSystem() {
  const fs = testVolume
  const authFilePath = path.join(HomeDirectory, ".nosto", ".auth.json")

  function writeFileContent(targetFile: string, content: string) {
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
  }

  return {
    writeFile: (targetFile: string, content: unknown | string) => {
      if (typeof content === "string") {
        writeFileContent(targetFile, content)
      } else {
        writeFileContent(targetFile, JSON.stringify(content))
      }
    },
    writeFolder: (targetFolder: string) => {
      const dir = path.join("/", targetFolder)
      fs.mkdirSync(dir, { recursive: true })
    },
    chmod: (targetFile: string, mode: number) => {
      const filePath = path.join("/", targetFile)
      fs.chmodSync(filePath, mode)
    },
    expectFile: (targetFile: string) => {
      const filePath = path.join("/", targetFile)
      return makeFileMatcher(filePath)
    },
    mockConfigFile: (overrides: Partial<PersistentConfig> = {}) => {
      const content = {
        ...getDefaultConfig(),
        merchant: "test-merchant",
        apiKey: "test-api-key",
        ...overrides
      }
      writeFileContent(".nosto.json", JSON.stringify(content))
    },
    mockUserAuthentication: () => {
      const userAuth = { user: "test", token: "test", expiresAt: new Date(Date.now() + 1000 * 60 * 60) }
      fs.mkdirSync(path.dirname(authFilePath), { recursive: true })
      writeFileContent(authFilePath, JSON.stringify(userAuth))
    },
    paths: {
      authFile: authFilePath
    }
  }
}

export function makeFileMatcher(path: string) {
  return {
    toContain: (expectedContent: string) => {
      const content = fs.readFileSync(path, "utf8")
      expect(content, `File ${path} actually has\n ${content}`).toEqual(expectedContent)
    },
    toExist: () => {
      return expect(fs.existsSync(path), `File ${path} does not exist when it was expected to`).toBe(true)
    },
    not: {
      toContain: (expectedContent: string) => {
        const content = fs.readFileSync(path, "utf8")
        expect(content, `File ${path} actually has\n ${content}`).not.toEqual(expectedContent)
      },
      toExist: () => {
        return expect(fs.existsSync(path), `File ${path} exists when it was not expected to`).toBe(false)
      }
    }
  }
}
