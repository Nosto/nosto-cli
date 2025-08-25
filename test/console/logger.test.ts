import { describe, expect, it, vi } from "vitest"

import { Logger } from "#console/logger.ts"

// Undo mocking of logger in setup.ts
vi.mock("#console/logger.ts", async importOriginal => importOriginal<typeof import("#console/logger.ts")>())

describe("Logger", () => {
  it("prints message to raw log", () => {
    const consoleMock = vi.spyOn(console, "log").mockImplementation(() => undefined)
    Logger.raw("Raw message")
    expect(consoleMock).toHaveBeenCalledWith("Raw message")
  })

  it("prints raw log when log level is error", () => {
    const consoleMock = vi.spyOn(console, "log").mockImplementation(() => undefined)
    Logger.context.logLevel = "error"
    Logger.raw("Raw message")
    expect(consoleMock).toHaveBeenCalledWith("Raw message")
  })

  it("prints raw log extra payload", () => {
    const consoleMock = vi.spyOn(console, "log").mockImplementation(() => undefined)
    Logger.raw("Raw message", new Error("Extra payload"))
    expect(consoleMock).toHaveBeenCalledWith(new Error("Extra payload"))
  })

  it("prints debug message when log level is debug", () => {
    const consoleMock = vi.spyOn(console, "debug").mockImplementation(() => undefined)
    Logger.context.logLevel = "debug"
    Logger.debug("Debug message")
    expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining("Debug message"))
  })

  it("does not print debug message when log level is info", () => {
    const consoleMock = vi.spyOn(console, "debug").mockImplementation(() => undefined)
    Logger.context.logLevel = "info"
    Logger.debug("Debug message")
    expect(consoleMock).not.toHaveBeenCalledWith(expect.stringContaining("Debug message"))
  })

  it("prints info message when log level is info", () => {
    const consoleMock = vi.spyOn(console, "info").mockImplementation(() => undefined)
    Logger.context.logLevel = "info"
    Logger.info("Info message")
    expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining("Info message"))
  })

  it("does not print info message when log level is warn", () => {
    const consoleMock = vi.spyOn(console, "info").mockImplementation(() => undefined)
    Logger.context.logLevel = "warn"
    Logger.info("Info message")
    expect(consoleMock).not.toHaveBeenCalledWith(expect.stringContaining("Info message"))
  })

  it("prints success message when log level is info", () => {
    const consoleMock = vi.spyOn(console, "info").mockImplementation(() => undefined)
    Logger.context.logLevel = "info"
    Logger.success("Success message")
    expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining("Success message"))
  })

  it("does not print success message when log level is warn", () => {
    const consoleMock = vi.spyOn(console, "log").mockImplementation(() => undefined)
    Logger.context.logLevel = "warn"
    Logger.success("Success message")
    expect(consoleMock).not.toHaveBeenCalledWith(expect.stringContaining("Success message"))
  })

  it("prints warn message when log level is warn", () => {
    const consoleMock = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    Logger.context.logLevel = "warn"
    Logger.warn("Warn message")
    expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining("Warn message"))
  })

  it("does not print warn message when log level is error", () => {
    const consoleMock = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    Logger.context.logLevel = "error"
    Logger.warn("Warn message")
    expect(consoleMock).not.toHaveBeenCalledWith(expect.stringContaining("Warn message"))
  })

  it("prints error message when log level is error", () => {
    const consoleMock = vi.spyOn(console, "error").mockImplementation(() => undefined)
    Logger.context.logLevel = "error"
    Logger.error("Error message")
    expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining("Error message"))
  })

  it("prints extra payload for errors", () => {
    const consoleMock = vi.spyOn(console, "error").mockImplementation(() => undefined)
    Logger.error("Error message", new Error("Test error"))
    expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining("Error: Test error"))
  })
})
