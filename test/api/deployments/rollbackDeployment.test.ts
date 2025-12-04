import { describe, expect, it } from "vitest"

import { rollbackDeployment } from "#api/deployments/rollbackDeployment.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { mockRollbackDeployment, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
setupMockConfig()

describe("rollbackDeployment", () => {
  it("should disable active deployment", async () => {
    const mock = mockRollbackDeployment(server, {})

    await rollbackDeployment()

    expect(mock.invocations).toHaveLength(1)
  })

  it("should throw an error when server returns error", async () => {
    mockRollbackDeployment(server, { error: { status: 500, message: "Server Error" } })

    await expect(rollbackDeployment()).rejects.toThrow()
  })

  it("should handle 404 when no active deployment exists", async () => {
    mockRollbackDeployment(server, { error: { status: 404, message: "Not Found" } })

    await expect(rollbackDeployment()).rejects.toThrow()
  })
})
