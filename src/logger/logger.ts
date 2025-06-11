import chalk from "chalk"
import { LogLevel } from "../config/schema.ts"

const formatTimestamp = (date: Date): string => {
  const pad = (num: number) => num.toString().padStart(2, "0")
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const Presets = {
  debug: {
    color: chalk.gray,
    prefix: chalk.gray("[DEBUG]"),
    logger: console.debug,
    logLevel: 0
  },
  info: {
    color: chalk.white,
    prefix: chalk.white("[INFO] "),
    logger: console.info,
    logLevel: 1
  },
  warn: {
    color: chalk.yellow,
    prefix: chalk.yellow("[WARN] "),
    logger: console.warn,
    logLevel: 2
  },
  error: {
    color: chalk.red,
    prefix: chalk.red("[ERROR]"),
    logger: console.error,
    logLevel: 3
  }
}

const printToLog = (message: string, preset: (typeof Presets)[keyof typeof Presets], extra?: unknown) => {
  const targetLogLevel = LogLevel.indexOf(Logger.logLevel)
  if (targetLogLevel > preset.logLevel) {
    return
  }
  const timestamp = chalk.dim(formatTimestamp(new Date()))
  preset.logger(`[${timestamp}] ${preset.color(message)}`)
  if (extra) {
    preset.logger(chalk.dim(JSON.stringify(extra, null, 2)))
  }
}

export const Logger = {
  logLevel: LogLevel[1] as (typeof LogLevel)[number],
  raw: (message: string, extra?: unknown) => {
    console.log(message)
    if (extra) {
      console.log(JSON.stringify(extra, null, 2))
    }
  },

  debug: (message: string, extra?: unknown) => {
    printToLog(message, Presets.debug, extra)
  },

  info: (message: string, extra?: unknown) => {
    printToLog(message, Presets.info, extra)
  },

  warn: (message: string, extra?: unknown) => {
    printToLog(message, Presets.warn, extra)
  },

  error: (message: string, extra?: unknown) => {
    printToLog(message, Presets.error, extra)
  }
}
