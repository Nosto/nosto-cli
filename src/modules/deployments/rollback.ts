import ora from "ora"

import { rollbackDeployment } from "#api/deployments/rollbackDeployment.ts"
import { Logger } from "#console/logger.ts"
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

  const isSilent = Logger.context.isSilent
  const spinner = isSilent ? null : ora("Disabling active deployment...").start()
  await rollbackDeployment()
  spinner?.succeed()

  Logger.success("Active deployment disabled successfully!")
}
