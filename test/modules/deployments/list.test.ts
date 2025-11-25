import { describe, expect, it } from "vitest"

import { deploymentsList } from "#modules/deployments/list.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { mockListDeployments, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
const terminal = setupMockConsole()
setupMockConfig()

describe("deploymentsList", () => {
  it("should display list of deployments", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true,
        userId: "tomas.jaseliunas@nosto.com",
        description: "Latest deployment"
      },
      {
        id: "1763737609",
        created: 1732199000000,
        active: true,
        latest: false,
        userId: "tomas.jaseliunas@nosto.com",
        description: "Additional fixes etc.."
      }
    ]

    mockListDeployments(server, { response: mockDeployments })

    await deploymentsList()

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Found 2 deployment(s):"))
    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("ID: 1763737018"))
    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("ID: 1763737609"))
    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Latest deployment"))
    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Additional fixes etc.."))
  })

  it("should display message when no deployments found", async () => {
    mockListDeployments(server, { response: [] })

    await deploymentsList()

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("No deployments found"))
  })

  it("should display deployments without optional fields", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true
      }
    ]

    mockListDeployments(server, { response: mockDeployments })

    await deploymentsList()

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Found 1 deployment(s):"))
    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("ID: 1763737018"))
  })

  it("should display active status correctly", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: true,
        latest: false
      }
    ]

    mockListDeployments(server, { response: mockDeployments })

    await deploymentsList()

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Active"))
  })

  it("should display inactive status correctly", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: false
      }
    ]

    mockListDeployments(server, { response: mockDeployments })

    await deploymentsList()

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("Inactive"))
  })

  it("should display latest badge for latest deployment", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true
      }
    ]

    mockListDeployments(server, { response: mockDeployments })

    await deploymentsList()

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringContaining("[LATEST]"))
  })

  it("should format dates correctly", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true
      }
    ]

    mockListDeployments(server, { response: mockDeployments })

    await deploymentsList()

    expect(terminal.getSpy("info")).toHaveBeenCalledWith(expect.stringMatching(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/))
  })
})
