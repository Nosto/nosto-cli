import { beforeEach } from "vitest"
import { vi } from "vitest"

import * as config from "#config/config.ts"
import { getCachedConfig } from "#config/config.ts"

beforeEach(() => {
  const realImplementation = getCachedConfig
  vi.spyOn(config, "getCachedConfig").mockImplementation(() => ({
    ...realImplementation(),
    retryDelay: 1
  }))
})
