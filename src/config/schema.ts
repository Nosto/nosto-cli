import z from "zod"

export const LogLevel = ["debug", "info", "warn", "error"] as const

export const PersistentConfigSchema = z.object({
  apiKey: z.string(),
  merchant: z.string(),
  templatesEnv: z.string().default("main"),
  apiUrl: z.string().default("https://api.nosto.com"),
  libraryUrl: z.string().default("https://d11ffvpvtnmt0d.cloudfront.net/library"),
  logLevel: z.enum(LogLevel).default("info"),
  maxRequests: z.coerce.number().default(15)
})

export const RuntimeConfigSchema = z.object({
  projectPath: z.string().default("."),
  dryRun: z.boolean().default(false),
  verbose: z.boolean().default(false)
})

export const EnvironmentConfigSchema = z.object({
  apiKey: z.string().optional(),
  merchant: z.string().optional(),
  templatesEnv: z.string().optional(),
  apiUrl: z.string().optional(),
  libraryUrl: z.string().optional(),
  logLevel: z.enum(LogLevel).optional(),
  maxRequests: z.coerce.number().optional()
})

export const PartialConfigSchema = PersistentConfigSchema.partial()

export type Config = PersistentConfig & RuntimeConfig
export type PersistentConfig = z.infer<typeof PersistentConfigSchema>
export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>
export type PartialConfig = z.infer<typeof PartialConfigSchema>
export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>
