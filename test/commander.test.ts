import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest"

import { MissingConfigurationError } from "#errors/MissingConfigurationError.ts"
import * as build from "#modules/search-templates/build.ts"
import * as dev from "#modules/search-templates/dev.ts"
import * as pull from "#modules/search-templates/pull.ts"
import * as push from "#modules/search-templates/push.ts"
import * as setup from "#modules/setup.ts"
import * as status from "#modules/status.ts"

import { setupMockCommander } from "./utils/mockCommander.ts"
import { setupMockFileSystem } from "./utils/mockFileSystem.ts"

const fs = setupMockFileSystem()
const commander = setupMockCommander()

let setupSpy: MockInstance
let statusSpy: MockInstance
let buildSpy: MockInstance
let pullSpy: MockInstance
let pushSpy: MockInstance
let devSpy: MockInstance

describe("commander", () => {
  // Make sure the actual functions are never called
  beforeEach(() => {
    setupSpy = vi.spyOn(setup, "printSetupHelp").mockImplementation(() => Promise.resolve())
    statusSpy = vi.spyOn(status, "printStatus").mockImplementation(() => Promise.resolve())
    buildSpy = vi.spyOn(build, "buildSearchTemplate").mockImplementation(() => Promise.resolve())
    pullSpy = vi.spyOn(pull, "pullSearchTemplate").mockImplementation(() => Promise.resolve())
    pushSpy = vi.spyOn(push, "pushSearchTemplate").mockImplementation(() => Promise.resolve())
    devSpy = vi.spyOn(dev, "searchTemplateDevMode").mockImplementation(() => Promise.resolve())
  })

  describe("nosto setup", () => {
    it("should call the function", async () => {
      await commander.run("nosto setup")
      expect(setupSpy).toHaveBeenCalledWith(".")
    })

    it("should call the function with project path", async () => {
      await commander.run("nosto setup /path/to/project")
      expect(setupSpy).toHaveBeenCalledWith("/path/to/project")
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

  describe("nosto st build", () => {
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
        expect(buildSpy).toHaveBeenCalledWith({ watch: false })
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
    it("should fail sanity check", async () => {
      await commander.run("nosto st pull")
      expect(pullSpy).not.toHaveBeenCalled()
    })

    describe("with valid environment", () => {
      beforeEach(() => {
        fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
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
