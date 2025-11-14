import { describe, expect, it } from "vitest"

import { promptForConfirmation } from "#console/userPrompt.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const terminal = setupMockConsole()

describe("promptForConfirmation", () => {
  it("should accept positive confirmation", async () => {
    terminal.setUserResponse("y")
    const response = await promptForConfirmation("Test prompt?", "Y")
    expect(response).toBe(true)
  })

  it("should accept negative confirmation", async () => {
    terminal.setUserResponse("n")
    const response = await promptForConfirmation("Test prompt?", "Y")
    expect(response).toBe(false)
  })

  it("should use default confirmation when input is empty", async () => {
    terminal.setUserResponse("")
    const responseYes = await promptForConfirmation("Test prompt?", "Y")
    expect(responseYes).toBe(true)

    terminal.setUserResponse("")
    const responseNo = await promptForConfirmation("Test prompt?", "N")
    expect(responseNo).toBe(false)
  })
})
