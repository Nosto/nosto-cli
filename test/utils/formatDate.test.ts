import { describe, expect, it } from "vitest"

import { formatDate } from "#utils/formatDate.ts"

describe("formatDate", () => {
  it("should format a Date object correctly", () => {
    const date = new Date("2025-11-21T14:56:58Z")
    const formatted = formatDate(date)

    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })

  it("should format a timestamp in milliseconds correctly", () => {
    const timestamp = 1732200000000 // Nov 21, 2024 14:40:00 GMT
    const formatted = formatDate(timestamp)

    expect(formatted).toBe("2024-11-21 14:40")
  })

  it("should pad single-digit months and days with zeros", () => {
    const date = new Date("2025-01-05T08:03:00Z")
    const formatted = formatDate(date)

    expect(formatted).toMatch(/^2025-01-05 \d{2}:\d{2}$/)
  })

  it("should pad single-digit hours and minutes with zeros", () => {
    const date = new Date("2025-11-21T08:03:00Z")
    const formatted = formatDate(date)

    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} 08:03$/)
  })

  it("should handle midnight correctly", () => {
    const date = new Date("2025-11-21T00:00:00Z")
    const formatted = formatDate(date)

    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} 00:00$/)
  })

  it("should handle end of day correctly", () => {
    const date = new Date("2025-11-21T23:59:00Z")
    const formatted = formatDate(date)

    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} 23:59$/)
  })

  it("should handle year boundaries correctly", () => {
    const date = new Date("2025-12-31T23:59:00Z")
    const formatted = formatDate(date)

    expect(formatted).toMatch(/^2025-12-31 23:59$/)
  })
})
