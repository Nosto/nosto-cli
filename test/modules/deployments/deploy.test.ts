import { describe, expect, it, vi } from "vitest"

import { deploymentsDeploy } from "#modules/deployments/deploy.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { mockCreateDeployment, mockFetchSourceFile, setupMockServer } from "#test/utils/mockServer.ts"

const server = setupMockServer()
const terminal = setupMockConsole()
const fs = setupMockFileSystem()
setupMockConfig()

vi.mock("#filesystem/calculateTreeHash.ts", () => ({
  calculateTreeHash: vi.fn(() => "abcd1234")
}))

describe("deploymentsDeploy", () => {
  it("should deploy when hashes match", async () => {
    mockFetchSourceFile(server, { path: "build/hash", response: "abcd1234", contentType: "raw" })
    fs.writeFile(".nostocache/hash", "abcd1234")
    const mock = mockCreateDeployment(server, { path: "build" })

    await deploymentsDeploy({ description: "Test deployment", force: true })

    expect(mock.invocations).toHaveLength(1)
    expect(mock.invocations[0]).toEqual({ description: "Test deployment" })
    expect(terminal.getSpy("success")).toHaveBeenCalledWith("Deployment created successfully!")
  })

  it("should show error when no remote files exist", async () => {
    mockFetchSourceFile(server, { path: "build/hash", error: { status: 404, message: "Not Found" } })

    await deploymentsDeploy({ description: "Test deployment", force: true })

    expect(terminal.getSpy("error")).toHaveBeenCalledWith(
      "No files found in remote. Please run 'st build --push' first to push your build."
    )
  })

  it("should prompt for description when not provided", async () => {
    mockFetchSourceFile(server, { path: "build/hash", response: "abcd1234", contentType: "raw" })
    fs.writeFile(".nostocache/hash", "abcd1234")
    terminal.setUserResponse("My deployment description")
    const mock = mockCreateDeployment(server, { path: "build" })

    await deploymentsDeploy({ force: true })

    expect(mock.invocations).toHaveLength(1)
    expect(mock.invocations[0]).toEqual({ description: "My deployment description" })
  })

  it("should cancel when empty description provided", async () => {
    mockFetchSourceFile(server, { path: "build/hash", response: "abcd1234", contentType: "raw" })
    fs.writeFile(".nostocache/hash", "abcd1234")
    terminal.setUserResponse("")
    const mock = mockCreateDeployment(server, { path: "build" })

    await deploymentsDeploy({ force: true })

    expect(mock.invocations).toHaveLength(0)
    expect(terminal.getSpy("error")).toHaveBeenCalledWith(
      "Description must be alphanumeric and between 1 and 200 characters."
    )
  })

  it("should warn and prompt when local hash doesn't match remote", async () => {
    mockFetchSourceFile(server, { path: "build/hash", response: "efgh5678", contentType: "raw" })
    fs.writeFile(".nostocache/hash", "efgh5678")
    terminal.setUserResponse("y")
    const mock = mockCreateDeployment(server, { path: "build" })

    await deploymentsDeploy({ description: "Test deployment", force: false })

    expect(terminal.getSpy("warn")).toHaveBeenCalledWith("Local files don't match remote.")
    expect(mock.invocations).toHaveLength(1)
  })

  it("should cancel deployment when user declines hash mismatch", async () => {
    mockFetchSourceFile(server, { path: "build/hash", response: "efgh5678", contentType: "raw" })
    fs.writeFile(".nostocache/hash", "efgh5678")
    terminal.setUserResponse("n")
    const mock = mockCreateDeployment(server, { path: "build" })

    await deploymentsDeploy({ description: "Test deployment", force: false })

    expect(mock.invocations).toHaveLength(0)
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Deployment cancelled by user.")
  })

  it("should warn when remote changed since last sync", async () => {
    mockFetchSourceFile(server, { path: "build/hash", response: "abcd1234", contentType: "raw" })
    fs.writeFile(".nostocache/hash", "different_hash")
    terminal.setUserResponse("y")
    const mock = mockCreateDeployment(server, { path: "build" })

    await deploymentsDeploy({ description: "Test deployment", force: false })

    expect(terminal.getSpy("warn")).toHaveBeenCalledWith("Remote files have changed since your last sync.")
    expect(mock.invocations).toHaveLength(1)
  })

  it("should update cache hash after successful deployment", async () => {
    mockFetchSourceFile(server, { path: "build/hash", response: "abcd1234", contentType: "raw" })
    fs.writeFile(".nostocache/hash", "old_hash")
    mockCreateDeployment(server, { path: "build" })

    await deploymentsDeploy({ description: "Test deployment", force: true })

    fs.expectFile(".nostocache/hash").toContain("abcd1234")
  })
})
