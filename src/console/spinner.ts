import ora from "ora"

export async function withSpinner<T>(text: string, operation: () => Promise<T>): Promise<T> {
  const spinner = ora(text).start()

  try {
    const result = await operation()
    spinner.succeed()
    return result
  } catch (error) {
    spinner.fail()
    throw error
  }
}
