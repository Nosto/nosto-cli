import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest"

import { clearCachedConfig, getCachedConfig } from "#config/config.ts"
import { MissingConfigurationError } from "#errors/MissingConfigurationError.ts"
import * as login from "#modules/login.ts"
import * as logout from "#modules/logout.ts"
import * as build from "#modules/search-templates/build.ts"
import * as deployModule from "#modules/search-templates/deploy.ts"
import * as dev from "#modules/search-templates/dev.ts"
import * as listModule from "#modules/search-templates/list.ts"
import * as pull from "#modules/search-templates/pull.ts"
import * as push from "#modules/search-templates/push.ts"
import * as redeployModule from "#modules/search-templates/redeploy.ts"
import * as rollbackModule from "#modules/search-templates/rollback.ts"
import * as setup from "#modules/setup.ts"
import * as status from "#modules/status.ts"

import { setupMockCommander } from "./utils/mockCommander.ts"
import { setupMockFileSystem } from "./utils/mockFileSystem.ts"

const fs = setupMockFileSystem()
const commander = setupMockCommander()

let loginSpy: MockInstance
let logoutSpy: MockInstance
let setupSpy: MockInstance
let statusSpy: MockInstance
let buildSpy: MockInstance
let pullSpy: MockInstance
let pushSpy: MockInstance
let devSpy: MockInstance
let deploymentsListSpy: MockInstance
let deploymentsDeploySpy: MockInstance
let deploymentsRedeploySpy: MockInstance
let deploymentsRollbackSpy: MockInstance

describe("commander", () => {
  beforeEach(() => {
    loginSpy = vi.spyOn(login, "loginToPlaycart").mockImplementation(() => Promise.resolve())
    logoutSpy = vi.spyOn(logout, "removeLoginCredentials").mockImplementation(() => Promise.resolve())
    setupSpy = vi.spyOn(setup, "printSetupHelp").mockImplementation(() => Promise.resolve())
    statusSpy = vi.spyOn(status, "printStatus").mockImplementation(() => Promise.resolve())
    buildSpy = vi.spyOn(build, "buildSearchTemplate").mockImplementation(() => Promise.resolve())
    pullSpy = vi.spyOn(pull, "pullSearchTemplate").mockImplementation(() => Promise.resolve())
    pushSpy = vi.spyOn(push, "pushSearchTemplate").mockImplementation(() => Promise.resolve())
    devSpy = vi.spyOn(dev, "searchTemplateDevMode").mockImplementation(() => Promise.resolve())
    deploymentsListSpy = vi.spyOn(listModule, "deploymentsList").mockImplementation(() => Promise.resolve())
    deploymentsDeploySpy = vi.spyOn(deployModule, "deploymentsDeploy").mockImplementation(() => Promise.resolve())
    deploymentsRedeploySpy = vi.spyOn(redeployModule, "deploymentsRedeploy").mockImplementation(() => Promise.resolve())
    deploymentsRollbackSpy = vi.spyOn(rollbackModule, "deploymentsRollback").mockImplementation(() => Promise.resolve())
    clearCachedConfig()
    fs.mockUserAuthentication()
  })

  describe("nosto login", () => {
    it("should call the function", async () => {
      await commander.run("nosto login")
      expect(loginSpy).toHaveBeenCalledWith()
    })

    it("should load the config", async () => {
      await commander.run("nosto login --verbose")
      expect(getCachedConfig().verbose).toBe(true)
    })
  })

  describe("nosto logout", () => {
    it("should call the function", async () => {
      await commander.run("nosto logout")
      expect(logoutSpy).toHaveBeenCalledWith()
    })
  })

  describe("nosto setup", () => {
    it("should call the function", async () => {
      await commander.run("nosto setup")
      expect(setupSpy).toHaveBeenCalledWith(".", {})
    })

    it("should call the function with project path", async () => {
      await commander.run("nosto setup /path/to/project")
      expect(setupSpy).toHaveBeenCalledWith("/path/to/project", {})
    })

    it("should handle MissingConfigurationError", async () => {
      vi.spyOn(setup, "printSetupHelp").mockImplementation(() => {
        throw new MissingConfigurationError("Missing configuration")
      })

      await commander.expect("nosto setup").toResolve()
    })

    it("should rethrow other errors", async () => {
      vi.spyOn(setup, "printSetupHelp").mockImplementation(() => {
        throw new Error("Unknown error")
      })

      await commander.expect("nosto setup").toThrow()
    })

    it("does not call other modules", async () => {
      await commander.run("nosto setup")
      expect(statusSpy).not.toHaveBeenCalled()
      expect(buildSpy).not.toHaveBeenCalled()
      expect(pullSpy).not.toHaveBeenCalled()
      expect(pushSpy).not.toHaveBeenCalled()
      expect(devSpy).not.toHaveBeenCalled()
    })
  })

  describe("nosto status", () => {
    it("should call the function", async () => {
      await commander.run("nosto status")
      expect(statusSpy).toHaveBeenCalledWith(".")
    })

    it("should call the function with project path", async () => {
      await commander.run("nosto status /path/to/project")
      expect(statusSpy).toHaveBeenCalledWith("/path/to/project")
    })

    it("should handle MissingConfigurationError", async () => {
      vi.spyOn(status, "printStatus").mockImplementation(() => {
        throw new MissingConfigurationError("Missing configuration")
      })

      await commander.expect("nosto status").toResolve()
    })

    it("should rethrow other errors", async () => {
      vi.spyOn(status, "printStatus").mockImplementation(() => {
        throw new Error("Unknown error")
      })

      await commander.expect("nosto status").toThrow()
    })

    it("does not call other modules", async () => {
      await commander.run("nosto status")
      expect(setupSpy).not.toHaveBeenCalled()
      expect(buildSpy).not.toHaveBeenCalled()
      expect(pullSpy).not.toHaveBeenCalled()
      expect(pushSpy).not.toHaveBeenCalled()
      expect(devSpy).not.toHaveBeenCalled()
    })
  })

  describe("nosto search-templates list", () => {
    beforeEach(() => {
      fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
    })

    it("should call the function", async () => {
      await commander.run("nosto st list")
      expect(deploymentsListSpy).toHaveBeenCalled()
    })

    it("should work with alias", async () => {
      await commander.run("nosto search-templates list")
      expect(deploymentsListSpy).toHaveBeenCalled()
    })

    it("should rethrow errors", async () => {
      vi.spyOn(listModule, "deploymentsList").mockImplementation(() => {
        throw new Error("Unknown error")
      })

      await commander.expect("nosto st list").toThrow()
    })
  })

  describe("nosto search-templates deploy", () => {
    beforeEach(() => {
      fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
    })

    it("should call the function with default options", async () => {
      await commander.run("nosto st deploy")
      expect(deploymentsDeploySpy).toHaveBeenCalledWith({
        description: undefined,
        force: false
      })
    })

    it("should call the function with description", async () => {
      await commander.run("nosto st deploy -d test-deployment")
      expect(deploymentsDeploySpy).toHaveBeenCalledWith({
        description: "test-deployment",
        force: false
      })
    })

    it("should call the function with force flag", async () => {
      await commander.run("nosto st deploy --force")
      expect(deploymentsDeploySpy).toHaveBeenCalledWith({
        description: undefined,
        force: true
      })
    })

    it("should rethrow errors", async () => {
      vi.spyOn(deployModule, "deploymentsDeploy").mockImplementation(() => {
        throw new Error("Unknown error")
      })

      await commander.expect("nosto st deploy").toThrow()
    })
  })

  describe("nosto search-templates redeploy", () => {
    beforeEach(() => {
      fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
    })

    it("should call the function with default options", async () => {
      await commander.run("nosto st redeploy")
      expect(deploymentsRedeploySpy).toHaveBeenCalledWith({
        deploymentId: undefined,
        force: false
      })
    })

    it("should call the function with deployment ID", async () => {
      await commander.run("nosto st redeploy -i deployment-123")
      expect(deploymentsRedeploySpy).toHaveBeenCalledWith({
        deploymentId: "deployment-123",
        force: false
      })
    })

    it("should call the function with force flag", async () => {
      await commander.run("nosto st redeploy --force")
      expect(deploymentsRedeploySpy).toHaveBeenCalledWith({
        deploymentId: undefined,
        force: true
      })
    })

    it("should rethrow errors", async () => {
      vi.spyOn(redeployModule, "deploymentsRedeploy").mockImplementation(() => {
        throw new Error("Unknown error")
      })

      await commander.expect("nosto st redeploy").toThrow()
    })
  })

  describe("nosto search-templates disable", () => {
    beforeEach(() => {
      fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
    })

    it("should call the function with default options", async () => {
      await commander.run("nosto st disable")
      expect(deploymentsRollbackSpy).toHaveBeenCalledWith({
        force: false
      })
    })

    it("should call the function with force flag", async () => {
      await commander.run("nosto st disable --force")
      expect(deploymentsRollbackSpy).toHaveBeenCalledWith({
        force: true
      })
    })

    it("should rethrow errors", async () => {
      vi.spyOn(rollbackModule, "deploymentsRollback").mockImplementation(() => {
        throw new Error("Unknown error")
      })

      await commander.expect("nosto st disable").toThrow()
    })
  })

  describe("nosto search-templates build", () => {
    it("should fail sanity check", async () => {
      await commander.run("nosto st build")
      expect(buildSpy).not.toHaveBeenCalled()
    })

    describe("with valid environment", () => {
      beforeEach(() => {
        fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
        fs.writeFile("index.js", "@nosto/preact")
      })

      it("should call the function", async () => {
        await commander.run("nosto st build")
        expect(buildSpy).toHaveBeenCalledWith({ watch: false, push: false })
      })

      it("should call the function with watch flag", async () => {
        await commander.run("nosto st build --watch")
        expect(buildSpy).toHaveBeenCalledWith({ watch: true, push: false })
      })

      it("should call the function with push flag", async () => {
        await commander.run("nosto st build --push")
        expect(buildSpy).toHaveBeenCalledWith({ watch: false, push: true })
      })

      it("should call the function with both watch and push flags", async () => {
        await commander.run("nosto st build -w -p")
        expect(buildSpy).toHaveBeenCalledWith({ watch: true, push: true })
      })

      it("should rethrow errors", async () => {
        vi.spyOn(build, "buildSearchTemplate").mockImplementation(() => {
          throw new Error("Unknown error")
        })

        await commander.expect("nosto st build").toThrow()
      })

      it("does not call other modules", async () => {
        await commander.run("nosto st build")
        expect(setupSpy).not.toHaveBeenCalled()
        expect(statusSpy).not.toHaveBeenCalled()
        expect(pullSpy).not.toHaveBeenCalled()
        expect(pushSpy).not.toHaveBeenCalled()
        expect(devSpy).not.toHaveBeenCalled()
      })
    })
  })

  describe("nosto search-templates pull", () => {
    beforeEach(() => {
      fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
    })
    it("should pull even without files present", async () => {
      await commander.run("nosto st pull")
      expect(pullSpy).toHaveBeenCalled()
    })

    describe("with valid environment", () => {
      beforeEach(() => {
        fs.writeFile("index.js", "@nosto/preact")
      })

      it("should call the function", async () => {
        await commander.run("nosto st pull")
        expect(pullSpy).toHaveBeenCalledWith({ force: false, paths: [] })
      })

      it("should call the function with short parameters", async () => {
        await commander.run("nosto st pull -f -p build index.js")
        expect(pullSpy).toHaveBeenCalledWith({ force: true, paths: ["build", "index.js"] })
      })

      it("should call the function with full parameters", async () => {
        await commander.run("nosto st pull --force --paths build index.js")
        expect(pullSpy).toHaveBeenCalledWith({ force: true, paths: ["build", "index.js"] })
      })

      it("should rethrow errors", async () => {
        vi.spyOn(pull, "pullSearchTemplate").mockImplementation(() => {
          throw new Error("Unknown error")
        })

        await commander.expect("nosto st pull").toThrow()
      })

      it("does not call other modules", async () => {
        await commander.run("nosto st pull")
        expect(setupSpy).not.toHaveBeenCalled()
        expect(statusSpy).not.toHaveBeenCalled()
        expect(buildSpy).not.toHaveBeenCalled()
      })
    })
  })

  describe("nosto search-templates push", () => {
    it("should fail sanity check", async () => {
      await commander.run("nosto st push")
      expect(pushSpy).not.toHaveBeenCalled()
    })

    describe("with valid environment", () => {
      beforeEach(() => {
        fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
        fs.writeFile("index.js", "@nosto/preact")
      })

      it("should call the build and push functions", async () => {
        await commander.run("nosto st push")
        expect(buildSpy).toHaveBeenCalledWith({ watch: false })
        expect(pushSpy).toHaveBeenCalledWith({ force: false, paths: [] })
      })

      it("should call the function with short parameters", async () => {
        await commander.run("nosto st push -f -p build index.js")
        expect(buildSpy).toHaveBeenCalledWith({ watch: false })
        expect(pushSpy).toHaveBeenCalledWith({ force: true, paths: ["build", "index.js"] })
      })

      it("should call the function with full parameters", async () => {
        await commander.run("nosto st push --force --paths build index.js")
        expect(buildSpy).toHaveBeenCalledWith({ watch: false })
        expect(pushSpy).toHaveBeenCalledWith({ force: true, paths: ["build", "index.js"] })
      })

      it("should rethrow errors", async () => {
        vi.spyOn(push, "pushSearchTemplate").mockImplementation(() => {
          throw new Error("Unknown error")
        })

        await commander.expect("nosto st push").toThrow()
      })

      it("does not call other modules", async () => {
        await commander.run("nosto st push")
        expect(setupSpy).not.toHaveBeenCalled()
        expect(statusSpy).not.toHaveBeenCalled()
        expect(pullSpy).not.toHaveBeenCalled()
      })
    })
  })

  describe("nosto search-templates dev", () => {
    it("should fail sanity check", async () => {
      await commander.run("nosto st dev")
      expect(devSpy).not.toHaveBeenCalled()
    })

    describe("with valid environment", () => {
      beforeEach(() => {
        fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
        fs.writeFile("index.js", "@nosto/preact")
      })

      it("should call the function", async () => {
        await commander.run("nosto st dev")
        expect(devSpy).toHaveBeenCalled()
      })

      it("should rethrow errors", async () => {
        vi.spyOn(dev, "searchTemplateDevMode").mockImplementation(() => {
          throw new Error("Unknown error")
        })

        await commander.expect("nosto st dev").toThrow()
      })

      it("does not call other modules", async () => {
        await commander.run("nosto st dev")
        expect(setupSpy).not.toHaveBeenCalled()
        expect(statusSpy).not.toHaveBeenCalled()
        expect(buildSpy).not.toHaveBeenCalled()
        expect(pullSpy).not.toHaveBeenCalled()
        expect(pushSpy).not.toHaveBeenCalled()
      })
    })
  })
})
