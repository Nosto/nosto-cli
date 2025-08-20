import mockFilesystem from "mock-fs"
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest"
import { setupServer } from "msw/node"
import { vi } from "vitest"
import { mockedConsoleIn, mockedConsoleOut } from "./utils/consoleMocks.ts"

vi.mock("readline/promises", () => {
  return {
    createInterface: () => mockedConsoleIn.interface
  }
})
vi.mock("#/console/logger.ts", () => mockedConsoleOut)

export const setupTestServer = () => {
  const server = setupServer()
  beforeAll(() => server.listen())
  afterEach(() => {
    server.resetHandlers()
  })
  afterAll(() => server.close())

  return server
}

beforeEach(() => {
  mockFilesystem({
    "/": {}
  })
  process.chdir("/")
})

afterAll(() => {
  mockFilesystem.restore()
})
