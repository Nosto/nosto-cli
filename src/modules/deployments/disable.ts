import { disableDeployment } from "#api/deployments/disableDeployment.ts"
import { Logger } from "#console/logger.ts"
import { promptForConfirmation } from "#console/userPrompt.ts"

type DisableOptions = {
  force: boolean
}

export async function deploymentsDisable({ force }: DisableOptions) {
  if (!force) {
    const confirmed = await promptForConfirmation(
      `Are you sure you want to disable the currently active deployment?`,
      "N"
    )
    if (!confirmed) {
      Logger.info("Operation cancelled by user.")
      return
    }
  }

  Logger.info("Disabling active deployment...")

  await disableDeployment()

  Logger.success("Active deployment disabled successfully!")
}
