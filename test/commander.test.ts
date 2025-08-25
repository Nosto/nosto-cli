import { beforeEach, describe, expect, it, vi } from "vitest"

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

describe("commander", () => {
  // Make sure the actual functions are never called
  beforeEach(() => {
    vi.spyOn(setup, "printSetupHelp").mockImplementation(() => Promise.resolve())
    vi.spyOn(status, "printStatus").mockImplementation(() => Promise.resolve())
    vi.spyOn(build, "buildSearchTemplate").mockImplementation(() => Promise.resolve())
    vi.spyOn(pull, "pullSearchTemplate").mockImplementation(() => Promise.resolve())
    vi.spyOn(push, "pushSearchTemplate").mockImplementation(() => Promise.resolve())
    vi.spyOn(dev, "searchTemplateDevMode").mockImplementation(() => Promise.resolve())
  })

  describe("nosto setup", () => {
    it("should call the function", async () => {
      const spy = vi.spyOn(setup, "printSetupHelp")
      await commander.run("nosto setup")
      expect(spy).toHaveBeenCalledWith(".")
    })

    it("should call the function with project path", async () => {
      const spy = vi.spyOn(setup, "printSetupHelp")
      await commander.run("nosto setup /path/to/project")
      expect(spy).toHaveBeenCalledWith("/path/to/project")
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
  })

  describe("nosto status", () => {
    it("should call the function", async () => {
      const spy = vi.spyOn(status, "printStatus")
      await commander.run("nosto status")
      expect(spy).toHaveBeenCalledWith(".")
    })

    it("should call the function with project path", async () => {
      const spy = vi.spyOn(status, "printStatus")
      await commander.run("nosto status /path/to/project")
      expect(spy).toHaveBeenCalledWith("/path/to/project")
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
  })

  describe("nosto st build", () => {
    it("should fail sanity check", async () => {
      const spy = vi.spyOn(build, "buildSearchTemplate")
      await commander.run("nosto st build")
      expect(spy).not.toHaveBeenCalled()
    })

    describe("with valid environment", () => {
      beforeEach(() => {
        fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
        fs.writeFile("index.js", "@nosto/preact")
      })

      it("should call the function", async () => {
        const spy = vi.spyOn(build, "buildSearchTemplate")
        await commander.run("nosto st build")
        expect(spy).toHaveBeenCalledWith({ watch: false })
      })

      it("should rethrow errors", async () => {
        vi.spyOn(build, "buildSearchTemplate").mockImplementation(() => {
          throw new Error("Unknown error")
        })

        await commander.expect("nosto st build").toThrow()
      })
    })
  })

  describe("nosto search-templates pull", () => {
    it("should fail sanity check", async () => {
      const spy = vi.spyOn(pull, "pullSearchTemplate")
      await commander.run("nosto st pull")
      expect(spy).not.toHaveBeenCalled()
    })

    describe("with valid environment", () => {
      beforeEach(() => {
        fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
        fs.writeFile("index.js", "@nosto/preact")
      })

      it("should call the function", async () => {
        const spy = vi.spyOn(pull, "pullSearchTemplate")
        await commander.run("nosto st pull")
        expect(spy).toHaveBeenCalledWith({ force: false, paths: [] })
      })

      it("should call the function with short parameters", async () => {
        const spy = vi.spyOn(pull, "pullSearchTemplate")
        await commander.run("nosto st pull -f -p build index.js")
        expect(spy).toHaveBeenCalledWith({ force: true, paths: ["build", "index.js"] })
      })

      it("should call the function with full parameters", async () => {
        const spy = vi.spyOn(pull, "pullSearchTemplate")
        await commander.run("nosto st pull --force --paths build index.js")
        expect(spy).toHaveBeenCalledWith({ force: true, paths: ["build", "index.js"] })
      })

      it("should rethrow errors", async () => {
        vi.spyOn(pull, "pullSearchTemplate").mockImplementation(() => {
          throw new Error("Unknown error")
        })

        await commander.expect("nosto st pull").toThrow()
      })
    })
  })

  describe("nosto search-templates push", () => {
    it("should fail sanity check", async () => {
      const spy = vi.spyOn(push, "pushSearchTemplate")
      await commander.run("nosto st push")
      expect(spy).not.toHaveBeenCalled()
    })

    describe("with valid environment", () => {
      beforeEach(() => {
        fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
        fs.writeFile("index.js", "@nosto/preact")
      })

      it("should call the function", async () => {
        const spy = vi.spyOn(push, "pushSearchTemplate")
        await commander.run("nosto st push")
        expect(spy).toHaveBeenCalledWith({ force: false, paths: [] })
      })

      it("should call the function with short parameters", async () => {
        const spy = vi.spyOn(push, "pushSearchTemplate")
        await commander.run("nosto st push -f -p build index.js")
        expect(spy).toHaveBeenCalledWith({ force: true, paths: ["build", "index.js"] })
      })

      it("should call the function with full parameters", async () => {
        const spy = vi.spyOn(push, "pushSearchTemplate")
        await commander.run("nosto st push --force --paths build index.js")
        expect(spy).toHaveBeenCalledWith({ force: true, paths: ["build", "index.js"] })
      })

      it("should rethrow errors", async () => {
        vi.spyOn(push, "pushSearchTemplate").mockImplementation(() => {
          throw new Error("Unknown error")
        })

        await commander.expect("nosto st push").toThrow()
      })
    })
  })

  describe("nosto search-templates dev", () => {
    it("should fail sanity check", async () => {
      const spy = vi.spyOn(dev, "searchTemplateDevMode")
      await commander.run("nosto st dev")
      expect(spy).not.toHaveBeenCalled()
    })

    describe("with valid environment", () => {
      beforeEach(() => {
        fs.writeFile(".nosto.json", JSON.stringify({ apiKey: "123", merchant: "456" }))
        fs.writeFile("index.js", "@nosto/preact")
      })

      it("should call the function", async () => {
        const spy = vi.spyOn(dev, "searchTemplateDevMode")
        await commander.run("nosto st dev")
        expect(spy).toHaveBeenCalled()
      })

      it("should rethrow errors", async () => {
        vi.spyOn(dev, "searchTemplateDevMode").mockImplementation(() => {
          throw new Error("Unknown error")
        })

        await commander.expect("nosto st dev").toThrow()
      })
    })
  })
})
