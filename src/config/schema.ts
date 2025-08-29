import z from "zod"

export const LogLevel = ["debug", "info", "warn", "error"] as const

// Persistent per-repo config (.nosto.json file)
export const PersistentConfigSchema = z.object({
  merchant: z.string(),
  templatesEnv: z.string().default("main"),
  apiUrl: z.string().default("https://api.nosto.com"),
  libraryUrl: z.string().default("https://d11ffvpvtnmt0d.cloudfront.net/library"),
  logLevel: z.enum(LogLevel).default("info"),
  maxRequests: z.coerce.number().default(15)
})

// Config provided on runtime (CLI options)
export const RuntimeConfigSchema = z.object({
  projectPath: z.string().default("."),
  dryRun: z.boolean().default(false),
  verbose: z.boolean().default(false)
})

// Authentication config (~/nosto/.auth.json file)
export const AuthConfigSchema = z.object({
  user: z.string(),
  authToken: z.string(),
  authExpiresAt: z.coerce.date()
})

// Environmental variables, alternative to persistent config
export const EnvironmentConfigSchema = z.object({
  merchant: z.string().optional(),
  templatesEnv: z.string().optional(),
  apiUrl: z.string().optional(),
  libraryUrl: z.string().optional(),
  logLevel: z.enum(LogLevel).optional(),
  maxRequests: z.coerce.number().optional()
})

export const PartialPersistentConfigSchema = PersistentConfigSchema.partial()

export type Config = PersistentConfig & RuntimeConfig & AuthConfig
export type PersistentConfig = z.infer<typeof PersistentConfigSchema>
export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>
export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>
export type AuthConfig = z.infer<typeof AuthConfigSchema>
export type PartialPersistentConfig = z.infer<typeof PartialPersistentConfigSchema>
