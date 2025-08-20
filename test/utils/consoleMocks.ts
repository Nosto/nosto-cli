import { expect, vi } from "vitest"

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

export function mockConsole() {
  const handle = mockedConsoleIn
  return {
    handle,
    setUserResponse: (response: string) => {
      handle.userResponse = response
    },
    clearPrompts: () => {
      handle.recordedPrompts = []
    },
    expect: {
      user: {
        toHaveBeenPromptedWith: (prompt: string) => {
          expect(
            handle.recordedPrompts.map(p => p.trim()),
            "No matching prompt found.\nExpected:\n" +
              prompt +
              "\nGot: \n" +
              handle.recordedPrompts.map(p => p.trim()).join("\n") +
              "\n\n"
          ).toContain(prompt.trim())
        }
      }
    }
  }
}
