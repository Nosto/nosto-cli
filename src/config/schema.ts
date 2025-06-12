import z from "zod"

export const LogLevel = ["debug", "info", "warn", "error"] as const

export const ConfigSchema = z.object({
  apiKey: z.string(),
  merchant: z.string(),
  templatesEnv: z.string().default("main"),
  apiUrl: z.string().default("https://my.nosto.com"),
  logLevel: z.enum(LogLevel).default("info"),
  maxRequests: z.coerce.number().default(3)
})

export const PartialConfigSchema = ConfigSchema.partial()

export type Config = z.infer<typeof ConfigSchema>
export type PartialConfig = z.infer<typeof PartialConfigSchema>
