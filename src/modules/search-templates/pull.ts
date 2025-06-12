import fs from "fs"
import path from "path"
import { listSourceFiles } from "../../api/listSourceFiles.ts"
import { fetchSourceFile } from "../../api/fetchSourceFile.ts"
import { Logger } from "../../logger/logger.ts"
import chalk from "chalk"

/**
 * Fetches the current templates to the specified target path.
 */
export async function pullSearchTemplate(targetPath: string, limitToPaths: string[]) {
  const targetFolder = path.resolve(targetPath)
  Logger.info(`Fetching templates to: ${chalk.cyan(targetFolder)}`)
  if (!fs.existsSync(targetFolder)) {
    throw new Error(`Target folder does not exist: ${chalk.cyan(targetFolder)}`)
  }
  if (!fs.statSync(targetFolder).isDirectory()) {
    throw new Error(`Target path is not a directory: ${chalk.cyan(targetFolder)}`)
  }

  const baseFiles = await listSourceFiles()
  const files = baseFiles.filter(file => limitToPaths.length === 0 || limitToPaths.includes(file.path))
  Logger.info(`Found ${chalk.cyan(files.length)} source files to fetch.`)

  for (const fileIndex in files) {
    const filePath = files[fileIndex].path
    Logger.info(`[${Number(fileIndex) + 1}/${files.length}]: ${chalk.cyan(filePath)}`)

    const data = await fetchSourceFile(filePath)
    const pathToWrite = path.join(targetFolder, filePath)

    Logger.debug(`Creating directory: ${path.dirname(pathToWrite)}`)
    fs.mkdirSync(path.dirname(pathToWrite), { recursive: true })

    Logger.debug(`Writing to file: ${pathToWrite}`)
    fs.writeFileSync(pathToWrite, data)
  }
}
