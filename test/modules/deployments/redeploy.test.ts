import { describe, expect, it, vi } from "vitest"

import { deploymentsRedeploy, selectDeploymentInteractively } from "#modules/deployments/redeploy.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { createMockDeployment } from "#test/utils/mockDeployment.ts"
import { mockListDeployments, mockUpdateDeployment, setupMockServer } from "#test/utils/mockServer.ts"

vi.mock("@inquirer/prompts", () => ({
  select: vi.fn()
}))

const server = setupMockServer()
const terminal = setupMockConsole()
setupMockConfig()

describe("deploymentsRedeploy", () => {
  it("should redeploy deployment by ID when provided", async () => {
    const mockDeployments = [
      createMockDeployment({
        id: "1763737018",
        latest: true,
        description: "Test deployment"
      })
    ]
    mockListDeployments(server, { response: mockDeployments })
    const mock = mockUpdateDeployment(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ deploymentId: "1763737018", force: true })

    expect(mock.invocations).toHaveLength(1)
    expect(terminal.getSpy("success")).toHaveBeenCalledWith("Redeployed successfully!")
  })

  it("should show error when deployment ID not found", async () => {
    const mockDeployments = [createMockDeployment({ id: "1763737018", latest: true })]
    mockListDeployments(server, { response: mockDeployments })
    const mock = mockUpdateDeployment(server, { deploymentId: "9999999999" })

    await deploymentsRedeploy({ deploymentId: "9999999999", force: true })

    expect(mock.invocations).toHaveLength(0)
    expect(terminal.getSpy("error")).toHaveBeenCalledWith('Deployment with ID "9999999999" not found.')
  })

  it("should display deployment info", async () => {
    const mockDeployments = [
      createMockDeployment({
        id: "1763737018",
        latest: true,
        description: "Test deployment"
      })
    ]
    mockListDeployments(server, { response: mockDeployments })
    mockUpdateDeployment(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ deploymentId: "1763737018", force: true })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Selected deployment: "))
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Description: Test deployment")
  })

  it("should prompt for confirmation when not forced", async () => {
    const mockDeployments = [createMockDeployment({ id: "1763737018", latest: true })]
    mockListDeployments(server, { response: mockDeployments })
    terminal.setUserResponse("y")
    const mock = mockUpdateDeployment(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ deploymentId: "1763737018", force: false })

    expect(mock.invocations).toHaveLength(1)
    terminal.expect.user.toHaveBeenPromptedWith("Are you sure you want to redeploy deployment 1763737018? (y/N):")
  })

  it("should cancel when user declines confirmation", async () => {
    const mockDeployments = [createMockDeployment({ id: "1763737018", latest: true })]
    mockListDeployments(server, { response: mockDeployments })
    terminal.setUserResponse("n")
    const mock = mockUpdateDeployment(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ deploymentId: "1763737018", force: false })

    expect(mock.invocations).toHaveLength(0)
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Redeployment cancelled by user.")
  })

  it("should handle deployment without description field", async () => {
    const mockDeployments = [createMockDeployment({ id: "1763737018", latest: true })]
    mockListDeployments(server, { response: mockDeployments })
    mockUpdateDeployment(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ deploymentId: "1763737018", force: true })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Selected deployment: "))
    expect(terminal.getSpy("info")).not.toHaveBeenCalledWith(expect.stringContaining("Description:"))
  })

  it("should display redeployment progress message", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true
      }
    ]
    mockListDeployments(server, { response: mockDeployments })
    mockUpdateDeployment(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ deploymentId: "1763737018", force: true })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Redeploying deployment"))
  })

  it("should error when no deployment selected interactively", async () => {
    mockListDeployments(server, { response: [] })

    await deploymentsRedeploy({ force: true })

    expect(terminal.getSpy("error")).toHaveBeenCalledWith("No deployment selected. Aborting.")
  })
})

describe("selectDeploymentInteractively", () => {
  it("should return null when no deployments found", async () => {
    mockListDeployments(server, { response: [] })

    const result = await selectDeploymentInteractively("Select deployment:")

    expect(result).toBeNull()
    expect(terminal.getSpy("error")).toHaveBeenCalledWith("No deployments found.")
  })

  it("should display active deployment indicator and format choices correctly", async () => {
    const { select } = await import("@inquirer/prompts")
    const mockDeployments = [
      createMockDeployment({
        id: "1763737018",
        created: 1732200000000,
        active: true,
        description: "Active deployment"
      }),
      createMockDeployment({
        id: "1763737019",
        created: 1732199000000,
        latest: true,
        description: "Latest deployment"
      }),
      createMockDeployment({
        id: "1763737020",
        created: 1732198000000
      })
    ]
    mockListDeployments(server, { response: mockDeployments })
    vi.mocked(select).mockResolvedValue("1763737018")

    const result = await selectDeploymentInteractively("Select deployment:")

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Currently active deployment"))
    expect(result).toEqual({
      id: "1763737018",
      deployment: mockDeployments[0]
    })
    expect(select).toHaveBeenCalledWith({
      message: "Select deployment:",
      choices: expect.arrayContaining([
        expect.objectContaining({
          value: "1763737018",
          description: "Active deployment"
        }),
        expect.objectContaining({
          value: "1763737019",
          description: "Latest deployment"
        }),
        expect.objectContaining({
          value: "1763737020",
          description: "No description"
        })
      ]),
      pageSize: 10
    })
  })

  it("should return null when no selection is made", async () => {
    const { select } = await import("@inquirer/prompts")
    const mockDeployments = [createMockDeployment({ id: "1763737018", latest: true })]
    mockListDeployments(server, { response: mockDeployments })
    vi.mocked(select).mockResolvedValue(undefined)

    const result = await selectDeploymentInteractively("Select deployment:")

    expect(result).toBeNull()
  })

  it("should return null when selected deployment not found", async () => {
    const { select } = await import("@inquirer/prompts")
    const mockDeployments = [createMockDeployment({ id: "1763737018", latest: true })]
    mockListDeployments(server, { response: mockDeployments })
    vi.mocked(select).mockResolvedValue("nonexistent")

    const result = await selectDeploymentInteractively("Select deployment:")

    expect(result).toBeNull()
  })

  it("should use interactive selection when no deploymentId provided", async () => {
    const { select } = await import("@inquirer/prompts")
    const mockDeployments = [
      createMockDeployment({
        id: "1763737018",
        latest: true,
        description: "Test deployment"
      })
    ]
    mockListDeployments(server, { response: mockDeployments })
    vi.mocked(select).mockResolvedValue("1763737018")
    const mock = mockUpdateDeployment(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ force: true })

    expect(select).toHaveBeenCalled()
    expect(mock.invocations).toHaveLength(1)
    expect(terminal.getSpy("success")).toHaveBeenCalledWith("Redeployed successfully!")
  })
})
