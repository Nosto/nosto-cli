import { describe, expect, it } from "vitest"

import { deploymentsRedeploy, selectDeploymentInteractively } from "#modules/deployments/redeploy.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { mockListDeployments, mockRedeploy, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
const terminal = setupMockConsole()
setupMockConfig()

describe("deploymentsRedeploy", () => {
  it("should redeploy deployment by ID when provided", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true,
        description: "Test deployment"
      }
    ]
    mockListDeployments(server, { response: mockDeployments })
    const mock = mockRedeploy(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ deploymentId: "1763737018", force: true })

    expect(mock.invocations).toHaveLength(1)
    expect(terminal.getSpy("success")).toHaveBeenCalledWith("Redeployed successfully!")
  })

  it("should show error when deployment ID not found", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true
      }
    ]
    mockListDeployments(server, { response: mockDeployments })
    const mock = mockRedeploy(server, { deploymentId: "9999999999" })

    await deploymentsRedeploy({ deploymentId: "9999999999", force: true })

    expect(mock.invocations).toHaveLength(0)
    expect(terminal.getSpy("error")).toHaveBeenCalledWith('Deployment with ID "9999999999" not found.')
  })

  it("should display deployment info", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true,
        description: "Test deployment"
      }
    ]
    mockListDeployments(server, { response: mockDeployments })
    mockRedeploy(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ deploymentId: "1763737018", force: true })

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Selected deployment: "))
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Description: Test deployment")
  })

  it("should prompt for confirmation when not forced", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true
      }
    ]
    mockListDeployments(server, { response: mockDeployments })
    terminal.setUserResponse("y")
    const mock = mockRedeploy(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ deploymentId: "1763737018", force: false })

    expect(mock.invocations).toHaveLength(1)
    terminal.expect.user.toHaveBeenPromptedWith("Are you sure you want to redeploy deployment 1763737018? (y/N):")
  })

  it("should cancel when user declines confirmation", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true
      }
    ]
    mockListDeployments(server, { response: mockDeployments })
    terminal.setUserResponse("n")
    const mock = mockRedeploy(server, { deploymentId: "1763737018" })

    await deploymentsRedeploy({ deploymentId: "1763737018", force: false })

    expect(mock.invocations).toHaveLength(0)
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Redeployment cancelled by user.")
  })
})

describe("selectDeploymentInteractively", () => {
  it("should return null when no deployments found", async () => {
    mockListDeployments(server, { response: [] })

    const result = await selectDeploymentInteractively("Select deployment:")

    expect(result).toBeNull()
    expect(terminal.getSpy("error")).toHaveBeenCalledWith("No deployments found.")
  })
})
