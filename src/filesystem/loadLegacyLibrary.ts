import { fetchLibraryFile } from "../api/library/fetchLibraryFile.ts"
import path from "node:path"
import { getCachedConfig } from "../config/config.ts"
import { writeFile } from "./filesystem.ts"
import { Logger } from "../console/logger.ts"
import chalk from "chalk"
import { cleanUrl } from "../api/utils.ts"
import { fetchWithRetry } from "../api/retry.ts"

export async function loadLegacyLibrary() {
  const { projectPath } = getCachedConfig()
  const filesToLoad = ["/nosto.module.js", "/nosto.module.js.map", "/nosto.d.ts"]
  let filesFetched = 0
  const fileCount = filesToLoad.length
  const promises = filesToLoad.map(async filename => {
    const result = await fetchWithRetry(fetchLibraryFile, filename).then(data => ({
      data,
      filename
    }))
    filesFetched++
    Logger.info(
      `${chalk.green("✓")} [${filesFetched}/${fileCount}] ${chalk.blue("↓")} ${chalk.cyan(cleanUrl(filename))}`
    )
    return result
  })
  const files = await Promise.all(promises)
  files.forEach(({ data, filename }) => {
    const filePath = path.join(projectPath, ".nostocache/library", filename)
    writeFile(filePath, data)
  })
}
