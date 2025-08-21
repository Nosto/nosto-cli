import path from "path"
import fs from "fs"
import { Logger } from "#console/logger.ts"
import { getCachedConfig } from "#config/config.ts"
import { isIgnored } from "./isIgnored.ts"

export function writeFile(pathToWrite: string, data: string) {
  if (getCachedConfig().dryRun) {
    return
  }
  if (!fs.existsSync(path.dirname(pathToWrite))) {
    Logger.debug(`Creating directory: ${path.dirname(pathToWrite)}`)
    fs.mkdirSync(path.dirname(pathToWrite), { recursive: true })
  }
  Logger.debug(`Writing to file: ${pathToWrite}`)
  fs.writeFileSync(pathToWrite, data)
}

export function readFileIfExists(pathToRead: string) {
  if (fs.existsSync(pathToRead)) {
    return fs.readFileSync(pathToRead, "utf-8")
  }
  return null
}

export function listAllFiles(folder: string) {
  const allFiles = fs.readdirSync(folder, { withFileTypes: true, recursive: true })
  const filteredFiles = allFiles
    .filter(dirent => !isIgnored(dirent))
    .map(dirent => dirent.parentPath + "/" + dirent.name)
    // To relative path
    .map(file => file.replace(folder + "/", ""))
  return {
    allFiles: filteredFiles,
    unfilteredFileCount: allFiles.length
  }
}
