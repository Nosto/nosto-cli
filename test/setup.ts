import { Volume } from "memfs"
import { beforeEach } from "vitest"
import { vi } from "vitest"

import { mockHttpServer } from "./utils/mockAuthServer.ts"
import { mockedConsoleIn, mockedConsoleOut, mockedInquirer, mockedSpinner } from "./utils/mockConsole.ts"

export const testVolume = Volume.fromJSON({}, "/")

vi.mock("fs", () => {
  return {
    default: testVolume
  }
})
beforeEach(() => {
  testVolume.reset()
  process.chdir("/")
})

vi.mock("readline/promises", () => {
  return {
    createInterface: () => mockedConsoleIn.interface
  }
})
vi.mock("#/console/logger.ts", () => mockedConsoleOut)

vi.mock("@inquirer/prompts", () => mockedInquirer)

vi.mock("node:test", () => {
  throw new Error("You seem to have accidentally imported node:test instead of vitest.")
})

vi.mock("open", () => {
  return {
    default: vi.fn()
  }
})

vi.mock("node:http", () => ({
  default: mockHttpServer
}))

vi.mock("ora", () => {
  return {
    default: vi.fn(() => mockedSpinner)
  }
})
