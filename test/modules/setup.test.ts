import { describe, it, expect } from "vitest"
import { printSetupHelp } from "#modules/setup.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const fs = setupMockFileSystem()
const terminal = setupMockConsole()

describe("Setup Module", () => {
  it("should print configuration help information", async () => {
    fs.createFile(".nosto.json", '{"apiKey": "test"}')

    expect(async () => await printSetupHelp(".")).not.toThrow()
    expect(terminal.getSpy("warn")).not.toHaveBeenCalledWith("Configuration file not found in project directory.")
  })

  it("should show warning when config file not found", async () => {
    terminal.setUserResponse("N")

    expect(async () => await printSetupHelp(".")).not.toThrow()
    expect(terminal.getSpy("warn")).toHaveBeenCalledWith("Configuration file not found in project directory.")
  })

  it("should create config file when user confirms", async () => {
    terminal.setUserResponse("Y")

    await printSetupHelp(".")

    terminal.expect.user.toHaveBeenPromptedWith("Would you like to create a placeholder configuration file? (Y/n):")
    fs.expectFile(".nosto.json").toExist()
  })

  it("should not create config file when user declines", async () => {
    terminal.setUserResponse("N")

    await printSetupHelp(".")

    fs.expectFile(".nosto.json").not.toExist()
  })

  it("should not prompt when config file already exists", async () => {
    fs.createFile(".nosto.json", '{"apiKey": "test"}')

    await printSetupHelp(".")

    terminal.expect.user.not.toHaveBeenPrompted()
  })
})
