import fs from "fs"
import path from "path"
import { putSourceFile } from "../components/api.js"

/**
 * Deploys templates to the specified target path.
 *
 * @param {string} targetPath - The path to the target directory (containing index.js).
 * @param {string[]} [limitToPaths] - Optional array of specific file paths to deploy.
 */
export async function deployTemplates(targetPath, limitToPaths) {
  const targetFolder = path.resolve(targetPath)
  if (!fs.existsSync(targetFolder)) {
    throw new Error(`Target folder does not exist: ${targetFolder}`)
  }
  if (!fs.statSync(targetFolder).isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetFolder}`)
  }

  console.info("Sanity checking the target directory...")
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

  console.info(`Found ${files.length} files to deploy.`)
  for (const file of files) {
    const filePath = path.join(targetFolder, file)
    console.info(`Deploying file: ${filePath} as ${file}`)
    await putSourceFile(file, fs.readFileSync(filePath, "utf-8"))
  }
}
