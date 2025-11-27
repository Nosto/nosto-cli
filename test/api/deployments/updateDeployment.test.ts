import { describe, expect, it } from "vitest"

import { updateDeployment } from "#api/deployments/updateDeployment.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { mockUpdateDeployment, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
setupMockConfig()

describe("updateDeployment", () => {
  it("should redeploy a deployment by ID", async () => {
    const mock = mockUpdateDeployment(server, { deploymentId: "1763737018" })

    await updateDeployment("1763737018")

    expect(mock.invocations).toHaveLength(1)
  })

  it("should throw an error when server returns error", async () => {
    mockUpdateDeployment(server, { deploymentId: "1763737018", error: { status: 500, message: "Server Error" } })

    await expect(updateDeployment("1763737018")).rejects.toThrow()
  })

  it("should handle different deployment IDs", async () => {
    const mock = mockUpdateDeployment(server, { deploymentId: "9999999999" })

    await updateDeployment("9999999999")

    expect(mock.invocations).toHaveLength(1)
  })
})
