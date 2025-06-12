import readline from "readline"

export async function promptForConfirmation(message: string, defaultAnswer: "Y" | "N"): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const ynPrompt = defaultAnswer === "Y" ? " (Y/n)" : " (y/N)"

  return new Promise(resolve => {
    rl.question(message + ynPrompt, answer => {
      rl.close()

      const evaluatedAnswer = answer.length === 0 ? defaultAnswer : answer.toUpperCase()
      resolve(evaluatedAnswer === "Y")
    })
  })
}
