import { describe, expect, it } from "vitest"

import { listDeployments } from "#api/deployments/listDeployments.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { mockListDeployments, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
setupMockConfig()

describe("listDeployments", () => {
  it("should fetch and return list of deployments", async () => {
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

    const deployments = await listDeployments()

    expect(deployments).toEqual(mockDeployments)
    expect(deployments).toHaveLength(2)
  })

  it("should return empty array when no deployments exist", async () => {
    mockListDeployments(server, { response: [] })

    const deployments = await listDeployments()

    expect(deployments).toEqual([])
    expect(deployments).toHaveLength(0)
  })

  it("should handle deployments without optional fields", async () => {
    const mockDeployments = [
      {
        id: "1763737018",
        created: 1732200000000,
        active: false,
        latest: true
      }
    ]

    mockListDeployments(server, { response: mockDeployments })

    const deployments = await listDeployments()

    expect(deployments).toEqual(mockDeployments)
    expect(deployments[0].userId).toBeUndefined()
    expect(deployments[0].description).toBeUndefined()
  })

  it("should throw an error when server returns error", async () => {
    mockListDeployments(server, { error: { status: 500, message: "Server Error" } })

    await expect(listDeployments()).rejects.toThrow()
  })

  it("should validate response schema", async () => {
    const invalidDeployments = [
      {
        id: "1763737018",
        // Missing required fields
        active: false
      }
    ]

    // @ts-expect-error - Testing invalid schema
    mockListDeployments(server, { response: invalidDeployments })

    await expect(listDeployments()).rejects.toThrow()
  })
})
