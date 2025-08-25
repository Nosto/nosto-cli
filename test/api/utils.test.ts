import { describe, expect, it } from "vitest"

import { cleanUrl } from "#api/utils.ts"

describe("API Utils", () => {
  describe("cleanUrl", () => {
    it("should remove leading slash", () => {
      expect(cleanUrl("/path/to/resource")).toBe("path/to/resource")
    })

    it("should remove trailing slash", () => {
      expect(cleanUrl("path/to/resource/")).toBe("path/to/resource")
    })

    it("should remove both leading and trailing slashes", () => {
      expect(cleanUrl("/path/to/resource/")).toBe("path/to/resource")
    })

    it("should not modify URL without slashes", () => {
      expect(cleanUrl("path/to/resource")).toBe("path/to/resource")
    })

    it("should handle empty string", () => {
      expect(cleanUrl("")).toBe("")
    })
  })
})
