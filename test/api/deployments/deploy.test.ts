import { describe, expect, it } from "vitest"

import { deploy } from "#api/deployments/deploy.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { mockDeploy, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
setupMockConfig()

describe("deploy", () => {
  it("should create a deployment with description", async () => {
    const mock = mockDeploy(server, { path: "build" })

    await deploy("build", "Test deployment")

    expect(mock.invocations).toHaveLength(1)
    expect(mock.invocations[0]).toEqual({ description: "Test deployment" })
  })

  it("should skip deployment in dry run mode", async () => {
    setupMockConfig({ dryRun: true })
    const mock = mockDeploy(server, { path: "build" })

    await deploy("build", "Test deployment")

    expect(mock.invocations).toHaveLength(0)
  })

  it("should throw an error when server returns error", async () => {
    mockDeploy(server, { path: "build", error: { status: 500, message: "Server Error" } })

    await expect(deploy("build", "Test deployment")).rejects.toThrow()
  })

  it("should handle empty description", async () => {
    const mock = mockDeploy(server, { path: "build" })

    await deploy("build", "")

    expect(mock.invocations).toHaveLength(1)
    expect(mock.invocations[0]).toEqual({ description: "" })
  })

  it("should use correct path in URL", async () => {
    const mock = mockDeploy(server, { path: "custom-path" })

    await deploy("custom-path", "Test deployment")

    expect(mock.invocations).toHaveLength(1)
  })
})
