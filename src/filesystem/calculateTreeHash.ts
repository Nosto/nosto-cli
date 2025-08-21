import fs from "fs"
import crypto from "crypto"
import { isIgnored } from "#filesystem/isIgnored.ts"
import { getCachedConfig } from "#config/config.ts"

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
  const filteredFiles = allFiles
    .filter(dirent => !isIgnored(dirent))
    .map(dirent => dirent.parentPath + "/" + dirent.name)
    // To relative path
    .map(file => file.replace(projectPath + "/", ""))
    .filter(file => file !== "build/hash")
  return filteredFiles
}
