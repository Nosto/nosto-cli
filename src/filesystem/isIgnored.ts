import { Dirent } from "fs"
import { getCachedConfig } from "#config/config.ts"
import fs from "fs"
import path from "path"
import ignore from "ignore"
import type { Ignore } from "ignore"

function isIgnoredImplicitly(dirent: Dirent): boolean {
  const { projectPath } = getCachedConfig()
  const absoluteProjectPath = path.resolve(projectPath)

  if (
    dirent.parentPath.startsWith(path.join(projectPath, "build")) ||
    dirent.parentPath.startsWith(path.join(absoluteProjectPath, "build"))
  ) {
    return false
  }

  const parentPathSections = dirent.parentPath.split("/")
  if (
    !dirent.isFile() ||
    dirent.name.startsWith(".") ||
    dirent.name.includes("node_modules") ||
    parentPathSections.some(section => section !== "." && section.startsWith("."))
  ) {
    return true
  }

  return false
}

export function isIgnoredExplicitly(instance: Ignore, dirent: Dirent): boolean {
  const { projectPath } = getCachedConfig()
  const absoluteProjectPath = path.resolve(projectPath)
  const relativePath = dirent.parentPath
    ? path.relative(absoluteProjectPath, path.join(dirent.parentPath, dirent.name))
    : dirent.name
  return instance.ignores(relativePath)
}

export function getIgnoreInstance() {
  const { projectPath } = getCachedConfig()

  const gitignorePath = path.join(projectPath, ".gitignore")
  const patterns: string[] = fs.existsSync(gitignorePath)
    ? fs
        .readFileSync(gitignorePath, "utf-8")
        .split(/\r?\n/)
        .filter(line => line.trim() && !line.startsWith("#"))
    : []

  const instance = ignore().add(patterns)
  return {
    isIgnored: (dirent: Dirent) => isIgnoredImplicitly(dirent) || isIgnoredExplicitly(instance, dirent)
  }
}
