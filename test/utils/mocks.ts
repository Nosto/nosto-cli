import { vi } from "vitest"

/**
 * Common mock utilities used across test files
 */

export const createLoggerMock = () => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
})

export const createConfigMock = (overrides: Record<string, unknown> = {}) => ({
  apiKey: "test-api-key",
  merchant: "test-merchant",
  templatesEnv: "main",
  apiUrl: "https://api.nosto.com",
  logLevel: "info",
  maxRequests: 15,
  projectPath: "/test/path",
  ...overrides
})

export const createFilesystemMock = () => ({
  existsSync: vi.fn(),
  statSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn()
})

export const createUserPromptMock = () => ({
  promptForConfirmation: vi.fn()
})
