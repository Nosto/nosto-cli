import { beforeEach } from "vitest"
import { vi } from "vitest"
import { Volume } from "memfs"
import { mockedConsoleIn, mockedConsoleOut } from "./utils/mockConsole.ts"

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

vi.mock("node:test", () => {
  throw new Error("You seem to have accidentally imported node:test instead of vitest.")
})
