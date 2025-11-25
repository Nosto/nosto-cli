import { describe, expect, it } from "vitest"

import { deploymentsDisable } from "#modules/deployments/disable.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { mockDisableDeployment, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
const terminal = setupMockConsole()
setupMockConfig()

describe("deploymentsDisable", () => {
  it("should disable deployment when user confirms", async () => {
    terminal.setUserResponse("y")
    const mock = mockDisableDeployment(server, {})

    await deploymentsDisable({ force: false })

    expect(mock.invocations).toHaveLength(1)
    expect(terminal.getSpy("success")).toHaveBeenCalledWith("Active deployment disabled successfully!")
  })

  it("should cancel when user declines", async () => {
    terminal.setUserResponse("n")
    const mock = mockDisableDeployment(server, {})

    await deploymentsDisable({ force: false })

    expect(mock.invocations).toHaveLength(0)
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Operation cancelled by user.")
  })

  it("should skip confirmation when force is true", async () => {
    const mock = mockDisableDeployment(server, {})

    await deploymentsDisable({ force: true })

    expect(mock.invocations).toHaveLength(1)
    expect(terminal.getSpy("success")).toHaveBeenCalledWith("Active deployment disabled successfully!")
  })

  it("should display confirmation message", async () => {
    terminal.setUserResponse("y")
    mockDisableDeployment(server, {})

    await deploymentsDisable({ force: false })

    terminal.expect.user.toHaveBeenPromptedWith(
      "Are you sure you want to disable the currently active deployment? (y/N):"
    )
  })

  it("should display progress message", async () => {
    mockDisableDeployment(server, {})

    await deploymentsDisable({ force: true })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Disabling active deployment...")
  })
})
