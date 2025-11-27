import { describe, expect, it } from "vitest"

import { createDeployment } from "#api/deployments/createDeployment.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { mockCreateDeployment, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
setupMockConfig()

describe("createDeployment", () => {
  it("should create a deployment with description", async () => {
    const mock = mockCreateDeployment(server, { path: "build" })

    await createDeployment({ path: "build", description: "Test deployment" })

    expect(mock.invocations).toHaveLength(1)
    expect(mock.invocations[0]).toEqual({ description: "Test deployment" })
  })

  it("should throw an error when server returns error", async () => {
    mockCreateDeployment(server, { path: "build", error: { status: 500, message: "Server Error" } })

    await expect(createDeployment({ path: "build", description: "Test deployment" })).rejects.toThrow()
  })

  it("should handle empty description", async () => {
    const mock = mockCreateDeployment(server, { path: "build" })

    await createDeployment({ path: "build", description: "" })

    expect(mock.invocations).toHaveLength(1)
    expect(mock.invocations[0]).toEqual({ description: "" })
  })

  it("should use correct path in URL", async () => {
    const mock = mockCreateDeployment(server, { path: "custom-path" })

    await createDeployment({ path: "custom-path", description: "Test deployment" })

    expect(mock.invocations).toHaveLength(1)
  })
})
