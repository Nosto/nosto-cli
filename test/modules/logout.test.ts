import { describe, expect, it } from "vitest"

import { AuthConfigFilePath } from "#config/authConfig.ts"
import { removeLoginCredentials } from "#modules/logout.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()
const terminal = setupMockConsole()

describe("Logout Module", () => {
  it("deletes the stored credentials", () => {
    fs.writeFile(AuthConfigFilePath, "some-credentials")

    removeLoginCredentials()

    fs.expectFile(AuthConfigFilePath).not.toExist()
  })

  it("warns if the credentials file does not exist", () => {
    removeLoginCredentials()
    expect(terminal.getSpy("warn")).toHaveBeenCalledWith("File already deleted.")
  })
})
