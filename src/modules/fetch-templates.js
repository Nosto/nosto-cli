import fs from "fs"
import path from "path"
import { fetchSourceList, fetchSourceFile } from "../components/api.js"

/**
 * Fetches the current templates to the specified target path.
 *
 * @param {string} targetPath - The path to the target directory (containing index.js).
 * @param {string[]} [limitToPaths] - Optional array of specific file paths to fetch.
 */
export async function fetchTemplates(targetPath, limitToPaths) {
  const targetFolder = path.resolve(targetPath)
  if (!fs.existsSync(targetFolder)) {
    throw new Error(`Target folder does not exist: ${targetFolder}`)
  }
  if (!fs.statSync(targetFolder).isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetFolder}`)
  }

  const baseFiles = await fetchSourceList()
  const files = baseFiles.filter(file => limitToPaths.length === 0 || limitToPaths.includes(file.path))
  console.info(`Found ${files.length} source files to fetch.`)

  for (const fileIndex in files) {
    const filePath = files[fileIndex].path
    console.info(`Fetching source file: ${filePath}`)
    const data = await fetchSourceFile(filePath)
    const pathToWrite = path.join(targetFolder, filePath)
    console.info(`Creating directory: ${path.dirname(pathToWrite)}`)
    fs.mkdirSync(path.dirname(pathToWrite), { recursive: true })
    console.info(`Writing to file: ${pathToWrite}`)
    fs.rmSync(pathToWrite)
    fs.writeFileSync(pathToWrite, data)
  }
}
