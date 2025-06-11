import z from "zod"

export const LogLevel = ["debug", "info", "warn", "error"] as const

export const ConfigSchema = z.object({
  apiKey: z.string(),
  merchant: z.string(),
  templatesEnv: z.string().default("main"),
  apiUrl: z.string().default("https://my.nosto.com"),
  logLevel: z.enum(LogLevel).default("info")
})

export const PartialConfigSchema = z.object({
  apiKey: z.string().optional(),
  merchant: z.string().optional(),
  templatesEnv: z.string().optional(),
  apiUrl: z.string().optional(),
  logLevel: z.enum(LogLevel).optional()
})

export type Config = z.infer<typeof ConfigSchema>
export type PartialConfig = z.infer<typeof PartialConfigSchema>
