import { rollbackDeployment } from "#api/deployments/rollbackDeployment.ts"
import { Logger } from "#console/logger.ts"
import { withSpinner } from "#console/spinner.ts"
import { promptForConfirmation } from "#console/userPrompt.ts"

type RollbackOptions = {
  force: boolean
}

export async function deploymentsRollback({ force }: RollbackOptions) {
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

  await withSpinner("Disabling active deployment...", async () => {
    await rollbackDeployment()
  })

  Logger.success("Active deployment disabled successfully!")
}
