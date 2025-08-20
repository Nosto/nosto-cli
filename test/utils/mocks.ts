import { expect, vi } from "vitest"
import * as fs from "fs"
import { Config } from "#config/schema.ts"
import * as config from "#config/config.ts"

/**
 * Common mock utilities used across test files
 */

export const createLoggerMock = () => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
})

export const createConfigMock = (overrides: Partial<Config> = {}) => ({
  apiKey: "test-api-key",
  merchant: "test-merchant",
  templatesEnv: "main",
  apiUrl: "https://api.nosto.com",
  logLevel: "info",
  maxRequests: 15,
  projectPath: "/test/path",
  ...overrides
})

export const createUserPromptMock = () => ({
  promptForConfirmation: vi.fn()
})

export function mockFilesystem() {
  return {
    workingDirectory: "/test/root",
    createFile: (path: string, content: string) => {
      fs.writeFileSync(path, content)
    },
    expectFile: (path: string) => makeFileMatcher(path)
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

export function mockConfig(overrides: Partial<Config> = {}) {
  vi.spyOn(config, "getCachedConfig").mockReturnValue({
    apiKey: "test-api-key",
    merchant: "test-merchant",
    templatesEnv: "main",
    apiUrl: "https://api.nosto.com",
    logLevel: "info",
    maxRequests: 15,
    projectPath: ".",
    libraryUrl: "https://library.nosto.com",
    dryRun: false,
    verbose: false,
    ...overrides
  })
}

export function resetConfigMock() {
  vi.spyOn(config, "getCachedConfig").mockReturnValue({
    apiKey: "test-api-key",
    merchant: "test-merchant",
    templatesEnv: "main",
    apiUrl: "https://api.nosto.com",
    logLevel: "info",
    maxRequests: 15,
    projectPath: "/",
    libraryUrl: "https://library.nosto.com",
    dryRun: false,
    verbose: false
  })
}
