import { beforeEach, vi } from "vitest"

import * as config from "#config/config.ts"
import { type Config } from "#config/schema.ts"

export function setupMockConfig(overrides: Partial<Config> = {}) {
  const mockConfig: Config = {
    apiKey: "test-api-key",
    merchant: "test-merchant",
    templatesEnv: "main",
    apiUrl: "https://api.nosto.com",
    logLevel: "info",
    maxRequests: 15,
    projectPath: "/",
    libraryUrl: "https://library.nosto.com",
    dryRun: false,
    verbose: false,
    ...overrides
  }

  // Connect immediately and on beforeEach so that this can be used at top level or in beforeEach
  vi.spyOn(config, "getCachedConfig").mockReturnValue(mockConfig)
  beforeEach(() => {
    vi.spyOn(config, "getCachedConfig").mockReturnValue(mockConfig)
  })
}
