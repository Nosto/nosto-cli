import z from "zod"

export const LogLevel = ["debug", "info", "warn", "error"] as const

export const PersistentConfigSchema = z.object({
  apiKey: z.string(),
  merchant: z.string(),
  templatesEnv: z.string().default("main"),
  apiUrl: z.string().default("https://api.nosto.com"),
  logLevel: z.enum(LogLevel).default("info"),
  maxRequests: z.coerce.number().default(3)
})

export const RuntimeConfigSchema = z.object({
  projectPath: z.string().default("."),
  dryRun: z.boolean().default(false)
})

export const PartialConfigSchema = PersistentConfigSchema.partial()

export type Config = PersistentConfig & RuntimeConfig
export type PersistentConfig = z.infer<typeof PersistentConfigSchema>
export type PartialConfig = z.infer<typeof PartialConfigSchema>
export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>
