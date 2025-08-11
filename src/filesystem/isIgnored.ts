import { Dirent } from "fs"
import { getCachedConfig } from "#config/config.ts"
import fs from "fs"
import path from "path"
import ignore from "ignore"
import type { Ignore } from "ignore"

export function isIgnored(dirent: Dirent): boolean {
  const { projectPath } = getCachedConfig()

  const parentPathSections = dirent.parentPath.split("/")
  if (
    !dirent.isFile() ||
    dirent.name.startsWith(".") ||
    dirent.name.includes("node_modules") ||
    parentPathSections.some(section => section.startsWith("."))
  ) {
    return true
  }

  const absoluteProjectPath = path.resolve(projectPath)
  const relativePath = dirent.parentPath
    ? path.relative(absoluteProjectPath, path.join(dirent.parentPath, dirent.name))
    : dirent.name

  return getIgnoreInstance().ignores(relativePath)
}

let ignoreInstance: Ignore | null = null

function getIgnoreInstance(): Ignore {
  if (ignoreInstance) {
    return ignoreInstance
  }

  const { projectPath } = getCachedConfig()

  const gitignorePath = path.join(projectPath, ".gitignore")
  const patterns: string[] = fs.existsSync(gitignorePath)
    ? fs
        .readFileSync(gitignorePath, "utf-8")
        .split(/\r?\n/)
        .filter(line => line.trim() && !line.startsWith("#"))
    : []

  ignoreInstance = ignore().add(patterns)
  return ignoreInstance
}
