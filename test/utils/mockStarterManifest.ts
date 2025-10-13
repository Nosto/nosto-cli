import path from "path"
import { vi } from "vitest"

import { SearchTemplatesConfig } from "#config/schema.ts"
import { makeConfig } from "#exports.ts"

import { setupMockFileSystem } from "./mockFileSystem.ts"

type Props = {
  projectPath?: string
  mockScript?: Partial<SearchTemplatesConfig>
}

export function setupMockStarterManifest({ projectPath, mockScript }: Props = {}) {
  const fs = setupMockFileSystem()
  const manifest = makeConfig({
    onBuild: async () => {
      console.log("Building...")
    },
    onBuildWatch: async () => {
      console.log("Watching...")
    },
    ...mockScript
  })

  const filePath = path.join("/", projectPath ?? "", "nosto.config.ts")

  vi.doMock(filePath, () => ({
    default: manifest
  }))

  let scriptBuilder = `export default {`
  Object.entries(manifest).forEach(([key, value]) => {
    scriptBuilder += `
    ${key}: ${value.toString()},
    `
  })
  scriptBuilder += `}`

  fs.writeFile(filePath, scriptBuilder)
  return manifest
}
