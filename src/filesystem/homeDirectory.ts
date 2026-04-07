import os from "os"

/**
 * `import.meta.env` is NOT defined in production builds
 */
export const HomeDirectory =
  (import.meta as { env?: { MODE?: string } }).env?.MODE === "test" ? "/vitest/home" : os.homedir()
