import { describe, expect, it } from "vitest"

import { redeploy } from "#api/deployments/redeploy.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { mockRedeploy, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
setupMockConfig()

describe("redeploy", () => {
  it("should redeploy a deployment by ID", async () => {
    const mock = mockRedeploy(server, { deploymentId: "1763737018" })

    await redeploy("1763737018")

    expect(mock.invocations).toHaveLength(1)
  })

  it("should throw an error when server returns error", async () => {
    mockRedeploy(server, { deploymentId: "1763737018", error: { status: 500, message: "Server Error" } })

    await expect(redeploy("1763737018")).rejects.toThrow()
  })

  it("should handle different deployment IDs", async () => {
    const mock = mockRedeploy(server, { deploymentId: "9999999999" })

    await redeploy("9999999999")

    expect(mock.invocations).toHaveLength(1)
  })
})
