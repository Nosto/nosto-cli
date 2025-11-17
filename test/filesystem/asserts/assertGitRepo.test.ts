import chalk from "chalk"
import { describe, expect, it } from "vitest"

import { assertGitRepo } from "#filesystem/asserts/assertGitRepo.ts"
import { setupMockConfig } from "#test/utils/mockConfig.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"

const fs = setupMockFileSystem()
const terminal = setupMockConsole()

describe("assertGitRepo", () => {
  it("prints a warning if not in a git repository", () => {
    setupMockConfig({ projectPath: "." })
    assertGitRepo()
    expect(terminal.getSpy("warn")).toHaveBeenCalledWith(
      `We heavily recommend using git for your projects. You can start with just running ${chalk.blueBright("git init")}`
    )
  })

  it("prints a warning if not in a git repository and not in project folder", () => {
    setupMockConfig({ projectPath: "/project" })
    assertGitRepo()
    expect(terminal.getSpy("warn")).toHaveBeenCalledWith(
      `We heavily recommend using git for your projects. You can start with just running ${chalk.blueBright("cd /project && git init")}`
    )
  })

  it("does not print a warning if in a git repository", () => {
    setupMockConfig({ projectPath: "." })
    fs.writeFolder(".git")
    assertGitRepo()
    expect(terminal.getSpy("warn")).not.toHaveBeenCalled()
  })
})
