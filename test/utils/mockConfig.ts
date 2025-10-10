import { beforeEach, vi } from "vitest"

import * as config from "#config/config.ts"
import { type Config, SearchTemplatesConfigSchema } from "#config/schema.ts"

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
    auth: {
      user: "",
      token: "",
      expiresAt: new Date(0)
    },
    searchTemplates: {
      mode: "unknown",
      data: SearchTemplatesConfigSchema.parse({})
    },
    ...overrides
  }

  // Connect immediately and on beforeEach so that this can be used at top level or in beforeEach
  vi.spyOn(config, "getCachedConfig").mockReturnValue(mockConfig)
  vi.spyOn(config, "getCachedSearchTemplatesConfig").mockReturnValue(mockConfig.searchTemplates.data)
  beforeEach(() => {
    vi.spyOn(config, "getCachedConfig").mockReturnValue(mockConfig)
    vi.spyOn(config, "getCachedSearchTemplatesConfig").mockReturnValue(mockConfig.searchTemplates.data)
  })
}
