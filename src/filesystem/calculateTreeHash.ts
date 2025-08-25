import crypto from "crypto"
import fs from "fs"

import { getCachedConfig } from "#config/config.ts"

import { getIgnoreInstance } from "./isIgnored.ts"

export function calculateTreeHash() {
  const hash = crypto.createHash("sha256")
  for (const filePath of listAllFilesForHashing()) {
    const fileContent = fs.readFileSync(filePath, "utf-8")
    hash.update(fileContent)
  }
  return hash.digest("hex")
}

export function listAllFilesForHashing() {
  const { projectPath } = getCachedConfig()
  const allFiles = fs.readdirSync(projectPath, { withFileTypes: true, recursive: true })
  const ignoreInstance = getIgnoreInstance()
  const filteredFiles = allFiles
    .filter(dirent => !ignoreInstance.isIgnored(dirent))
    .map(dirent => dirent.parentPath + "/" + dirent.name)
    // To relative path
    .map(file => file.replace(projectPath + "/", ""))
    .filter(file => file !== "build/hash")
  return filteredFiles
}
