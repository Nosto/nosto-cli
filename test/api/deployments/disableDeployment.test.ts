import { describe, expect, it } from "vitest"

import { disableDeployment } from "#api/deployments/disableDeployment.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { mockDisableDeployment, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
setupMockConfig()

describe("disableDeployment", () => {
  it("should disable active deployment", async () => {
    const mock = mockDisableDeployment(server, {})

    await disableDeployment()

    expect(mock.invocations).toHaveLength(1)
  })

  it("should skip disabling in dry run mode", async () => {
    setupMockConfig({ dryRun: true })
    const mock = mockDisableDeployment(server, {})

    await disableDeployment()

    expect(mock.invocations).toHaveLength(0)
  })

  it("should throw an error when server returns error", async () => {
    mockDisableDeployment(server, { error: { status: 500, message: "Server Error" } })

    await expect(disableDeployment()).rejects.toThrow()
  })

  it("should handle 404 when no active deployment exists", async () => {
    mockDisableDeployment(server, { error: { status: 404, message: "Not Found" } })

    await expect(disableDeployment()).rejects.toThrow()
  })
})
