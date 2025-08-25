import { describe, expect, it, vi } from "vitest"

import * as commanderWrapper from "#commander.ts"

describe("index", () => {
  it("should pass process.argv to runCLI", async () => {
    const spy = vi.spyOn(commanderWrapper, "runCLI")

    const argv = ["/cwd", "nosto", "setup"]
    process.argv = argv
    await import("#/index.ts")

    expect(spy).toHaveBeenCalledWith(argv)
  })
})
