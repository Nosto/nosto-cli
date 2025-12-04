import { describe, expect, it } from "vitest"

import { isValidAlphaNumeric } from "#utils/validations.ts"

describe("isValidAlphaNumeric", () => {
  it("should accept valid alphanumeric strings", () => {
    expect(isValidAlphaNumeric("Test deployment")).toBe(true)
    expect(isValidAlphaNumeric("My deployment 123")).toBe(true)
    expect(isValidAlphaNumeric("Production-v1.2.3")).toBe(true)
  })

  it("should accept strings with allowed special characters", () => {
    expect(isValidAlphaNumeric("Test-deployment_v1.0")).toBe(true)
    expect(isValidAlphaNumeric("What is this?")).toBe(true)
    expect(isValidAlphaNumeric("Hello, world!")).toBe(true)
  })

  it("should reject strings longer than 200 characters", () => {
    const longString = "a".repeat(201)
    expect(isValidAlphaNumeric(longString)).toBe(false)
  })

  it("should accept strings up to 200 characters", () => {
    const maxString = "a".repeat(200)
    expect(isValidAlphaNumeric(maxString)).toBe(true)
  })

  it("should reject empty strings", () => {
    expect(isValidAlphaNumeric("")).toBe(false)
  })

  it("should reject non-string values", () => {
    expect(isValidAlphaNumeric(null)).toBe(false)
    expect(isValidAlphaNumeric(undefined)).toBe(false)
    expect(isValidAlphaNumeric(123)).toBe(false)
    expect(isValidAlphaNumeric({})).toBe(false)
    expect(isValidAlphaNumeric([])).toBe(false)
  })

  it("should reject strings with disallowed special characters", () => {
    expect(isValidAlphaNumeric("test@deployment")).toBe(false)
    expect(isValidAlphaNumeric("test#deployment")).toBe(false)
    expect(isValidAlphaNumeric("test$deployment")).toBe(false)
    expect(isValidAlphaNumeric("test%deployment")).toBe(false)
  })

  it("should accept strings with spaces", () => {
    expect(isValidAlphaNumeric("This is a test")).toBe(true)
    expect(isValidAlphaNumeric("Multiple   spaces")).toBe(true)
  })

  it("should reject strings with newlines", () => {
    expect(isValidAlphaNumeric("Test\ndeployment")).toBe(false)
    expect(isValidAlphaNumeric("Multiple\n\nlines")).toBe(false)
    expect(isValidAlphaNumeric("Test\rdeployment")).toBe(false)
    expect(isValidAlphaNumeric("Test\r\ndeployment")).toBe(false)
  })
})
