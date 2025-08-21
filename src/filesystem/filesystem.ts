import path from "path"
import fs from "fs"
import { Logger } from "#console/logger.ts"
import { getCachedConfig } from "#config/config.ts"
import { getIgnoreInstance } from "./isIgnored.ts"

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
  const allDirents = fs.readdirSync(folder, { withFileTypes: true, recursive: true })
  const allFiles = allDirents.filter(dirent => !dirent.isDirectory())
  const ignoreInstance = getIgnoreInstance()
  const filteredFiles = allFiles
    .filter(dirent => !ignoreInstance.isIgnored(dirent))
    .map(dirent => dirent.parentPath + "/" + dirent.name)
    .map(file => path.relative(folder, file))
  return {
    allFiles: filteredFiles,
    unfilteredFileCount: allFiles.length
  }
}
