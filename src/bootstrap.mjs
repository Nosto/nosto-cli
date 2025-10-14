#!/usr/bin/env node
import { spawn } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const directoryName = dirname(fileURLToPath(import.meta.url))

const loaderUrl = import.meta.resolve("tsx")
const loaderPath = fileURLToPath(loaderUrl)

const entry = resolve(directoryName, "index.ts")
const child = spawn(process.execPath, ["--import", loaderPath, entry, ...process.argv.slice(2)], { stdio: "inherit" })

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  else process.exit(code ?? 0)
})
