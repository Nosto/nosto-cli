import { afterEach, expect, vi } from "vitest"

export const mockedConsoleIn = {
  userResponse: "q",
  recordedPrompts: [] as string[],
  interface: {
    question: (prompt: string) => {
      mockedConsoleIn.recordedPrompts.push(prompt)
      return mockedConsoleIn.userResponse
    },
    close: vi.fn()
  }
}

export const mockedConsoleOut = {
  Logger: {
    context: {
      logLevel: "info",
      merchantId: "",
      isDryRun: false
    },
    raw: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}

export function setupMockConsole() {
  afterEach(() => {
    mockedConsoleIn.recordedPrompts = []
  })

  return {
    setUserResponse: (response: string) => {
      mockedConsoleIn.userResponse = response
    },
    clearPrompts: () => {
      mockedConsoleIn.recordedPrompts = []
    },
    getSpy: (method: Exclude<keyof typeof mockedConsoleOut.Logger, "context">) => {
      return mockedConsoleOut.Logger[method]
    },
    expect: {
      user: {
        toHaveBeenPromptedWith: (prompt: string) => {
          expect(
            mockedConsoleIn.recordedPrompts.map(p => p.trim()),
            "No matching prompt found.\nExpected:\n" +
              prompt +
              "\nGot: \n" +
              mockedConsoleIn.recordedPrompts.map(p => p.trim()).join("\n") +
              "\n\n"
          ).toContain(prompt.trim())
        },
        not: {
          toHaveBeenPrompted: () => {
            expect(mockedConsoleIn.recordedPrompts.length, "Prompt was recorded when it was not expected").toBe(0)
          }
        }
      }
    }
  }
}
