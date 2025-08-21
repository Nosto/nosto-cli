import chalk from "chalk"
import { getCachedConfig } from "#config/config.ts"
import { Logger } from "#console/logger.ts"

type Props = {
  files: string[]
  logIcon: string
  processElement: (file: string) => Promise<unknown>
}

export async function processInBatches({ files, logIcon, processElement }: Props) {
  const batchSize = getCachedConfig().maxRequests
  const batches = []
  let filesProcessed = 0
  const totalFilesToPush = files.length
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize))
  }
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const batchPromises = batch.map(async file => {
      try {
        await processElement(file)
        filesProcessed += 1
        Logger.info(`${chalk.green("✓")} [${filesProcessed}/${totalFilesToPush}] ${logIcon} ${chalk.cyan(file)}`)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        Logger.error(`${chalk.red("✗")} ${chalk.cyan(file)}: ${errorMessage}`)
      }
    })
    const results = await Promise.allSettled(batchPromises)
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected")
    if (failures.length > 0) {
      Logger.warn(`Batch completed with ${failures.length} failures`)
    }
  }
}
