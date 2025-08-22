import { fetchLibraryFile } from "#api/library/fetchLibraryFile.ts"
import path from "path"
import { writeFile } from "./filesystem.ts"
import { Logger } from "#console/logger.ts"
import chalk from "chalk"
import { cleanUrl } from "#api/utils.ts"
import { fetchWithRetry } from "#api/retry.ts"

export async function loadLibrary(libraryPath: string) {
  const filesToLoad = ["/nosto.module.js", "/nosto.module.js.map", "/nosto.d.ts"]
  let filesFetched = 0
  const fileCount = filesToLoad.length
  const promises = filesToLoad.map(async filename => {
    const data = await fetchWithRetry(fetchLibraryFile, filename)
    filesFetched++
    Logger.info(
      `${chalk.green("✓")} [${filesFetched}/${fileCount}] ${chalk.blue("↓")} ${chalk.cyan(cleanUrl(filename))}`
    )
    return {
      data,
      filename
    }
  })
  const files = await Promise.all(promises)
  files.forEach(({ data, filename }) => {
    const filePath = path.join(libraryPath, filename)
    writeFile(filePath, data)
  })
}
