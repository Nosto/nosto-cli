import { expect } from "vitest"

import { runCLI } from "#commander.ts"

export function setupMockCommander() {
  return {
    async run(command: string) {
      return runCLI(["/cwd", ...command.split(" ")])
    },

    expect(command: string) {
      return {
        toThrow: async () => {
          await expect(this.run(command)).rejects.toThrow()
        },
        toResolve: async () => {
          await expect(this.run(command)).resolves.not.toThrow()
        }
      }
    }
  }
}
