import { describe, it, vi, beforeEach, expect } from "vitest"
import { searchTemplateDevMode } from "#modules/search-templates/dev.ts"
import * as esbuild from "#filesystem/esbuild.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const mockConsole = setupMockConsole()

describe("Search Template Dev Mode", () => {
  const mockContext = {
    watch: vi.fn(),
    dispose: vi.fn()
  }

  beforeEach(() => {
    vi.spyOn(esbuild, "getBuildContext").mockReturnValue(
      mockContext as unknown as ReturnType<typeof esbuild.getBuildContext>
    )
  })

  it("should start watching when confirmed", async () => {
    const getBuildContext = vi.spyOn(esbuild, "getBuildContext")

    await searchTemplateDevMode()

    expect(getBuildContext).toHaveBeenCalledWith({ plugins: [expect.objectContaining({ name: "push-on-rebuild" })] })
    expect(mockContext.watch).toHaveBeenCalled()
  })

  it("should skip confirmation when flag is set", async () => {
    await searchTemplateDevMode()

    mockConsole.expect.user.not.toHaveBeenPrompted()
    expect(mockContext.watch).toHaveBeenCalled()
  })

  it("should set up SIGINT handler", async () => {
    const processOnSpy = vi.spyOn(process, "on").mockImplementation(() => process)

    await searchTemplateDevMode()

    expect(processOnSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function))

    processOnSpy.mockRestore()
  })
})
