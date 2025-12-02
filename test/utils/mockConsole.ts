import { afterEach, expect, vi } from "vitest"

export const mockedInquirer = {
  select: vi.fn()
}

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
    success: vi.fn(),
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
    mockedInquirer.select.mockReset()
  })

  return {
    setUserResponse: (response: string) => {
      mockedConsoleIn.userResponse = response
    },
    setSelectResponse: (response: string | undefined) => {
      mockedInquirer.select.mockResolvedValue(response)
    },
    setContext: (context: Partial<typeof mockedConsoleOut.Logger.context>) => {
      mockedConsoleOut.Logger.context = {
        ...mockedConsoleOut.Logger.context,
        ...context
      }
    },
    clearPrompts: () => {
      mockedConsoleIn.recordedPrompts = []
    },
    resetMocks: () => {
      mockedConsoleOut.Logger.success.mockReset()
      mockedConsoleOut.Logger.raw.mockReset()
      mockedConsoleOut.Logger.debug.mockReset()
      mockedConsoleOut.Logger.info.mockReset()
      mockedConsoleOut.Logger.warn.mockReset()
      mockedConsoleOut.Logger.error.mockReset()
      mockedConsoleOut.Logger.context = {
        logLevel: "info",
        merchantId: "",
        isDryRun: false
      }
    },
    getSpy: (method: Exclude<keyof typeof mockedConsoleOut.Logger, "context">) => {
      return mockedConsoleOut.Logger[method]
    },
    getSelectSpy: () => {
      return mockedInquirer.select
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
