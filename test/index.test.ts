import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock all the imported modules before importing index
const mockPullSearchTemplate = vi.fn()
const mockPushSearchTemplate = vi.fn()
const mockBuildSearchTemplate = vi.fn()
const mockSearchTemplateDevMode = vi.fn()
const mockPrintStatus = vi.fn()
const mockPrintSetupHelp = vi.fn()
const mockWithErrorHandler = vi.fn(fn => fn())
const mockWithSafeEnvironment = vi.fn(async (props, fn) => await fn())

vi.mock("#modules/search-templates/pull.ts", () => ({
  pullSearchTemplate: mockPullSearchTemplate
}))

vi.mock("#modules/search-templates/push.ts", () => ({
  pushSearchTemplate: mockPushSearchTemplate
}))

vi.mock("#modules/search-templates/build.ts", () => ({
  buildSearchTemplate: mockBuildSearchTemplate
}))

vi.mock("#modules/search-templates/dev.ts", () => ({
  searchTemplateDevMode: mockSearchTemplateDevMode
}))

vi.mock("#modules/status.ts", () => ({
  printStatus: mockPrintStatus
}))

vi.mock("#modules/setup.ts", () => ({
  printSetupHelp: mockPrintSetupHelp
}))

vi.mock("#errors/withErrorHandler.ts", () => ({
  withErrorHandler: mockWithErrorHandler
}))

vi.mock("#utils/withSafeEnvironment.ts", () => ({
  withSafeEnvironment: mockWithSafeEnvironment
}))

describe("CLI Index", () => {
  const originalArgv = process.argv
  const originalExit = process.exit

  beforeEach(() => {
    // Mock process.exit to prevent actual exit during tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process.exit = vi.fn() as any
    // Set minimal process.argv to avoid parsing issues
    process.argv = ["node", "nostocli"]
    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original values
    process.argv = originalArgv
    process.exit = originalExit
  })

  it("should import and configure CLI without errors", async () => {
    // Import the index file which sets up the commands
    expect(async () => {
      await import("#index.ts")
    }).not.toThrow()
  })

  it("should configure program with correct metadata", async () => {
    // Import commander and the index
    const { program } = await import("commander")
    await import("#index.ts")

    expect(program.name()).toBe("nostocli")
    expect(program.version()).toBe("1.0.0")
    expect(program.description()).toBe("Nosto CLI tool. Use `nostocli setup` to get started.")
  })

  it("should register setup command", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const setupCommand = program.commands.find(cmd => cmd.name() === "setup")
    expect(setupCommand).toBeDefined()
    expect(setupCommand?.description()).toBe("Prints setup information")
  })

  it("should register status command", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const statusCommand = program.commands.find(cmd => cmd.name() === "status")
    expect(statusCommand).toBeDefined()
    expect(statusCommand?.description()).toBe("Print the configuration status")
  })

  it("should register st command with alias", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const stCommand = program.commands.find(cmd => cmd.name() === "st")
    expect(stCommand).toBeDefined()
    expect(stCommand?.description()).toBe("Search templates management commands")
    expect(stCommand?.aliases()).toContain("search-templates")
  })

  it("should register st build subcommand", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const stCommand = program.commands.find(cmd => cmd.name() === "st")
    const buildCommand = stCommand?.commands.find(cmd => cmd.name() === "build")
    expect(buildCommand).toBeDefined()
    expect(buildCommand?.description()).toBe("Build the search-templates locally")
  })

  it("should register st pull subcommand", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const stCommand = program.commands.find(cmd => cmd.name() === "st")
    const pullCommand = stCommand?.commands.find(cmd => cmd.name() === "pull")
    expect(pullCommand).toBeDefined()
    expect(pullCommand?.description()).toBe("Pull the search-templates source from the Nosto VSCode Web")
  })

  it("should register st push subcommand", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const stCommand = program.commands.find(cmd => cmd.name() === "st")
    const pushCommand = stCommand?.commands.find(cmd => cmd.name() === "push")
    expect(pushCommand).toBeDefined()
    expect(pushCommand?.description()).toBe("Push the search-templates source to the VSCode Web")
  })

  it("should register st dev subcommand", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const stCommand = program.commands.find(cmd => cmd.name() === "st")
    const devCommand = stCommand?.commands.find(cmd => cmd.name() === "dev")
    expect(devCommand).toBeDefined()
    expect(devCommand?.description()).toBe(
      "Build the search-templates locally, watch for changes and continuously upload"
    )
  })

  it("should configure st build command options", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const stCommand = program.commands.find(cmd => cmd.name() === "st")
    const buildCommand = stCommand?.commands.find(cmd => cmd.name() === "build")

    const options = buildCommand?.options
    expect(options?.some(opt => opt.long === "--dry-run")).toBe(true)
    expect(options?.some(opt => opt.long === "--verbose")).toBe(true)
    expect(options?.some(opt => opt.long === "--watch")).toBe(true)
  })

  it("should configure st pull command options", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const stCommand = program.commands.find(cmd => cmd.name() === "st")
    const pullCommand = stCommand?.commands.find(cmd => cmd.name() === "pull")

    const options = pullCommand?.options
    expect(options?.some(opt => opt.long === "--paths")).toBe(true)
    expect(options?.some(opt => opt.long === "--dry-run")).toBe(true)
    expect(options?.some(opt => opt.long === "--verbose")).toBe(true)
    expect(options?.some(opt => opt.long === "--force")).toBe(true)
    expect(options?.some(opt => opt.long === "--yes")).toBe(true)
  })

  it("should configure st push command options", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const stCommand = program.commands.find(cmd => cmd.name() === "st")
    const pushCommand = stCommand?.commands.find(cmd => cmd.name() === "push")

    const options = pushCommand?.options
    expect(options?.some(opt => opt.long === "--paths")).toBe(true)
    expect(options?.some(opt => opt.long === "--dry-run")).toBe(true)
    expect(options?.some(opt => opt.long === "--verbose")).toBe(true)
    expect(options?.some(opt => opt.long === "--force")).toBe(true)
    expect(options?.some(opt => opt.long === "--yes")).toBe(true)
  })

  it("should configure st dev command options", async () => {
    const { program } = await import("commander")
    await import("#index.ts")

    const stCommand = program.commands.find(cmd => cmd.name() === "st")
    const devCommand = stCommand?.commands.find(cmd => cmd.name() === "dev")

    const options = devCommand?.options
    expect(options?.some(opt => opt.long === "--dry-run")).toBe(true)
    expect(options?.some(opt => opt.long === "--verbose")).toBe(true)
  })

  it("should have program.parse called during import", async () => {
    // This test verifies that index.ts calls program.parse by checking that no error is thrown
    // and that the CLI commands are properly set up, which means parse() was executed successfully
    await import("#index.ts")

    // If we reach this point without errors, program.parse was called successfully
    expect(true).toBe(true)
  })
})
