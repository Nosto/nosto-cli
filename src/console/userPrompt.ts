import chalk from "chalk"
import { createInterface } from "readline/promises"

export async function promptForConfirmation(message: string, defaultAnswer: "Y" | "N") {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const ynPrompt = defaultAnswer === "Y" ? " (Y/n): " : " (y/N): "

  const answer = await rl.question("\n" + message + chalk.gray(ynPrompt))
  rl.close()
  const evaluatedAnswer = answer.length === 0 ? defaultAnswer : answer.toUpperCase()
  return evaluatedAnswer === "Y"
}

export async function promptForInput(message: string) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const answer = await rl.question("\n" + message + " ")
  rl.close()
  return answer.trim()
}
