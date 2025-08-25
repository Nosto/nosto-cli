import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest"
import { createCLI } from "#index.ts"

// Import the modules to spy on them
import * as pullModule from "#modules/search-templates/pull.ts"
import * as pushModule from "#modules/search-templates/push.ts"
import * as buildModule from "#modules/search-templates/build.ts"
import * as devModule from "#modules/search-templates/dev.ts"
import * as statusModule from "#modules/status.ts"
import * as setupModule from "#modules/setup.ts"

// Only mock I/O boundaries as per testing guidelines
const mockWithErrorHandler = vi.hoisted(() => vi.fn((fn: () => void | Promise<void>) => fn()))
const mockWithSafeEnvironment = vi.hoisted(() =>
  vi.fn(async (_props: unknown, fn: () => void | Promise<void>) => await fn())
)

vi.mock("#errors/withErrorHandler.ts", () => ({
  withErrorHandler: mockWithErrorHandler
}))

vi.mock("#utils/withSafeEnvironment.ts", () => ({
  withSafeEnvironment: mockWithSafeEnvironment
}))

describe("CLI Index", () => {
  const originalArgv = process.argv
  const originalExit = process.exit

  // Spies for business logic modules
  let pullSearchTemplateSpy: MockInstance
  let pushSearchTemplateSpy: MockInstance
  let buildSearchTemplateSpy: MockInstance
  let searchTemplateDevModeSpy: MockInstance
  let printStatusSpy: MockInstance
  let printSetupHelpSpy: MockInstance
  let mockProcessExit: MockInstance

  beforeEach(() => {
    // Mock process.exit to prevent actual exit during tests
    mockProcessExit = vi.fn() as MockInstance
    process.exit = mockProcessExit as never

    // Set minimal process.argv to avoid parsing issues
    process.argv = ["node", "nostocli"]

    // Create spies for business logic modules
    pullSearchTemplateSpy = vi.spyOn(pullModule, "pullSearchTemplate").mockResolvedValue()
    pushSearchTemplateSpy = vi.spyOn(pushModule, "pushSearchTemplate").mockResolvedValue()
    buildSearchTemplateSpy = vi.spyOn(buildModule, "buildSearchTemplate").mockResolvedValue()
    searchTemplateDevModeSpy = vi.spyOn(devModule, "searchTemplateDevMode").mockResolvedValue()
    printStatusSpy = vi.spyOn(statusModule, "printStatus").mockImplementation(() => {})
    printSetupHelpSpy = vi.spyOn(setupModule, "printSetupHelp").mockResolvedValue()

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original values
    process.argv = originalArgv
    process.exit = originalExit

    // Restore all spies
    vi.restoreAllMocks()
  })

  describe("CLI Configuration", () => {
    it("should configure program with correct metadata", () => {
      const program = createCLI()

      expect(program.name()).toBe("nostocli")
      expect(program.version()).toBe("1.0.0")
      expect(program.description()).toBe("Nosto CLI tool. Use `nostocli setup` to get started.")
    })

    it("should register setup command", () => {
      const program = createCLI()

      const setupCommand = program.commands.find(cmd => cmd.name() === "setup")
      expect(setupCommand).toBeDefined()
      expect(setupCommand?.description()).toBe("Prints setup information")
    })

    it("should register status command", () => {
      const program = createCLI()

      const statusCommand = program.commands.find(cmd => cmd.name() === "status")
      expect(statusCommand).toBeDefined()
      expect(statusCommand?.description()).toBe("Print the configuration status")
    })

    it("should register st command with alias", () => {
      const program = createCLI()

      const stCommand = program.commands.find(cmd => cmd.name() === "st")
      expect(stCommand).toBeDefined()
      expect(stCommand?.description()).toBe("Search templates management commands")
      expect(stCommand?.aliases()).toContain("search-templates")
    })

    it("should register st build subcommand with options", () => {
      const program = createCLI()

      const stCommand = program.commands.find(cmd => cmd.name() === "st")
      const buildCommand = stCommand?.commands.find(cmd => cmd.name() === "build")
      expect(buildCommand).toBeDefined()
      expect(buildCommand?.description()).toBe("Build the search-templates locally")

      const options = buildCommand?.options
      expect(options?.some(opt => opt.long === "--dry-run")).toBe(true)
      expect(options?.some(opt => opt.long === "--verbose")).toBe(true)
      expect(options?.some(opt => opt.long === "--watch")).toBe(true)
    })

    it("should register st pull subcommand with options", () => {
      const program = createCLI()

      const stCommand = program.commands.find(cmd => cmd.name() === "st")
      const pullCommand = stCommand?.commands.find(cmd => cmd.name() === "pull")
      expect(pullCommand).toBeDefined()
      expect(pullCommand?.description()).toBe("Pull the search-templates source from the Nosto VSCode Web")

      const options = pullCommand?.options
      expect(options?.some(opt => opt.long === "--paths")).toBe(true)
      expect(options?.some(opt => opt.long === "--dry-run")).toBe(true)
      expect(options?.some(opt => opt.long === "--verbose")).toBe(true)
      expect(options?.some(opt => opt.long === "--force")).toBe(true)
      expect(options?.some(opt => opt.long === "--yes")).toBe(true)
    })

    it("should register st push subcommand with options", () => {
      const program = createCLI()

      const stCommand = program.commands.find(cmd => cmd.name() === "st")
      const pushCommand = stCommand?.commands.find(cmd => cmd.name() === "push")
      expect(pushCommand).toBeDefined()
      expect(pushCommand?.description()).toBe("Push the search-templates source to the VSCode Web")

      const options = pushCommand?.options
      expect(options?.some(opt => opt.long === "--paths")).toBe(true)
      expect(options?.some(opt => opt.long === "--dry-run")).toBe(true)
      expect(options?.some(opt => opt.long === "--verbose")).toBe(true)
      expect(options?.some(opt => opt.long === "--force")).toBe(true)
      expect(options?.some(opt => opt.long === "--yes")).toBe(true)
    })

    it("should register st dev subcommand with options", () => {
      const program = createCLI()

      const stCommand = program.commands.find(cmd => cmd.name() === "st")
      const devCommand = stCommand?.commands.find(cmd => cmd.name() === "dev")
      expect(devCommand).toBeDefined()
      expect(devCommand?.description()).toBe(
        "Build the search-templates locally, watch for changes and continuously upload"
      )

      const options = devCommand?.options
      expect(options?.some(opt => opt.long === "--dry-run")).toBe(true)
      expect(options?.some(opt => opt.long === "--verbose")).toBe(true)
    })
  })

  describe("Command Execution", () => {
    it("should call printSetupHelp when setup command is executed", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "setup", "/test/path"])

      expect(mockWithErrorHandler).toHaveBeenCalled()
      expect(printSetupHelpSpy).toHaveBeenCalledWith("/test/path")
    })

    it("should call printSetupHelp with default path when no path provided", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "setup"])

      expect(printSetupHelpSpy).toHaveBeenCalledWith(".")
    })

    it("should call printStatus when status command is executed", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "status", "/test/path"])

      expect(mockWithErrorHandler).toHaveBeenCalled()
      expect(printStatusSpy).toHaveBeenCalledWith("/test/path")
    })

    it("should call printStatus with default path when no path provided", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "status"])

      expect(printStatusSpy).toHaveBeenCalledWith(".")
    })

    it("should call buildSearchTemplate when st build command is executed", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "st", "build", "/test/path", "--watch"])

      expect(mockWithSafeEnvironment).toHaveBeenCalledWith(
        { projectPath: "/test/path", options: expect.objectContaining({ watch: true }) },
        expect.any(Function)
      )
      expect(buildSearchTemplateSpy).toHaveBeenCalledWith({ watch: true })
    })

    it("should call buildSearchTemplate with watch false by default", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "st", "build"])

      expect(buildSearchTemplateSpy).toHaveBeenCalledWith({ watch: false })
    })

    it("should call pullSearchTemplate when st pull command is executed", async () => {
      const program = createCLI()

      await program.parseAsync([
        "node",
        "nostocli",
        "st",
        "pull",
        "/test/path",
        "--paths",
        "file1.js",
        "file2.js",
        "--force"
      ])

      expect(mockWithSafeEnvironment).toHaveBeenCalledWith(
        {
          projectPath: "/test/path",
          options: expect.objectContaining({ paths: ["file1.js", "file2.js"], force: true })
        },
        expect.any(Function)
      )
      expect(pullSearchTemplateSpy).toHaveBeenCalledWith({
        paths: ["file1.js", "file2.js"],
        force: true
      })
    })

    it("should call pullSearchTemplate with default values", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "st", "pull"])

      expect(pullSearchTemplateSpy).toHaveBeenCalledWith({
        paths: [],
        force: false
      })
    })

    it("should call buildSearchTemplate and pushSearchTemplate when st push command is executed", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "st", "push", "/test/path", "--paths", "file1.js", "--force"])

      expect(mockWithSafeEnvironment).toHaveBeenCalledWith(
        { projectPath: "/test/path", options: expect.objectContaining({ paths: ["file1.js"], force: true }) },
        expect.any(Function)
      )
      expect(buildSearchTemplateSpy).toHaveBeenCalledWith({ watch: false })
      expect(pushSearchTemplateSpy).toHaveBeenCalledWith({
        paths: ["file1.js"],
        force: true
      })
    })

    it("should call pushSearchTemplate with default values", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "st", "push"])

      expect(pushSearchTemplateSpy).toHaveBeenCalledWith({
        paths: [],
        force: false
      })
    })

    it("should call searchTemplateDevMode when st dev command is executed", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "st", "dev", "/test/path"])

      expect(mockWithSafeEnvironment).toHaveBeenCalledWith(
        { projectPath: "/test/path", options: expect.any(Object) },
        expect.any(Function)
      )
      expect(searchTemplateDevModeSpy).toHaveBeenCalled()
    })

    it("should support search-templates alias for st command", async () => {
      const program = createCLI()

      await program.parseAsync(["node", "nostocli", "search-templates", "build"])

      expect(buildSearchTemplateSpy).toHaveBeenCalledWith({ watch: false })
    })
  })
})
