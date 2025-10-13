import { describe, expect, it } from "vitest"

import { parseSearchTemplatesConfigFile } from "#config/searchTemplatesConfig.ts"
import { NostoError } from "#errors/NostoError.ts"
import { setupMockStarterManifest } from "#test/utils/mockStarterManifest.ts"

describe("Search Templates Config", () => {
  describe("parseSearchTemplatesConfigFile", () => {
    it("should return legacy mode when config file does not exist", async () => {
      const result = await parseSearchTemplatesConfigFile({ projectPath: "." })

      expect(result).toEqual({
        mode: "legacy",
        data: {
          onBuild: expect.any(Function),
          onBuildWatch: expect.any(Function)
        }
      })
    })

    it("should return modern mode with valid config file", async () => {
      const manifest = setupMockStarterManifest()
      const result = await parseSearchTemplatesConfigFile({ projectPath: "." })

      expect(result.mode).toBe("modern")
      expect(result.data.onBuild).toBe(manifest.onBuild)
      expect(result.data.onBuildWatch).toBe(manifest.onBuildWatch)
    })

    it("should throw NostoError for invalid config schema", async () => {
      setupMockStarterManifest({
        mockScript: {
          // @ts-expect-error Testing invalid schema
          invalidProp: "this should not be here"
        }
      })
      await expect(parseSearchTemplatesConfigFile({ projectPath: "." })).rejects.toThrow(NostoError)
      await expect(parseSearchTemplatesConfigFile({ projectPath: "." })).rejects.toThrow(
        "Invalid nosto.config.ts file:"
      )
    })
  })
})
