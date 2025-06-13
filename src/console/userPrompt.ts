import { createInterface } from "readline/promises"

export async function promptForConfirmation(message: string, defaultAnswer: "Y" | "N"): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const ynPrompt = defaultAnswer === "Y" ? " (Y/n): " : " (y/N): "

  const answer = await rl.question(message + ynPrompt)
  rl.close()
  const evaluatedAnswer = answer.length === 0 ? defaultAnswer : answer.toUpperCase()
  return evaluatedAnswer === "Y"
}
