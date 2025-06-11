import fs from "fs"
import path from "path"
import { putSourceFile } from "../api/putSourceFile.ts"
import { Logger } from "../logger/logger.ts"
import chalk from "chalk"

/**
 * Deploys templates to the specified target path.
 */
export async function deployTemplates(targetPath: string, limitToPaths: string[]) {
  const targetFolder = path.resolve(targetPath)
  if (!fs.existsSync(targetFolder)) {
    throw new Error(`Target folder does not exist: ${targetFolder}`)
  }
  if (!fs.statSync(targetFolder).isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetFolder}`)
  }

  Logger.debug("Sanity checking the target directory...")
  // Read the index.js file in the current directory and ensure it has a mention of @nosto/preact
  const indexFilePath = path.join(targetFolder, "index.js")
  if (!fs.existsSync(indexFilePath)) {
    throw new Error(`Index file does not exist: ${indexFilePath}`)
  }
  const indexFileContent = fs.readFileSync(indexFilePath, "utf-8")
  if (!indexFileContent.includes("@nosto/preact")) {
    throw new Error(`Index file does not contain @nosto/preact: ${indexFilePath}`)
  }

  // Recursively list all files in the directory (excluding files in gitignore)
  const files = fs
    .readdirSync(targetFolder, { withFileTypes: true, recursive: true })
    .filter(dirent => dirent.isFile() && !dirent.name.startsWith("."))
    .filter(dirent => !dirent.name.includes("node_modules"))
    .map(dirent => dirent.parentPath + "/" + dirent.name)
    // To relative path
    .map(file => file.replace(targetFolder + "/", ""))
    .filter(file => limitToPaths.length === 0 || limitToPaths.includes(file))

  Logger.info(`Found ${chalk.cyan(files.length)} files to deploy.`)
  for (const fileIndex in files) {
    const file = files[fileIndex]
    const filePath = path.join(targetFolder, file)
    Logger.info(`[${Number(fileIndex) + 1}/${files.length}]: ${chalk.cyan(filePath)}`)
    await putSourceFile(file, fs.readFileSync(filePath, "utf-8"))
  }
}
