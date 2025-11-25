import z from "zod"

export const ListDeploymentsSchema = z.array(
  z.object({
  id: z.string(),
  created: z.number(),
  active: z.boolean(),
  latest: z.boolean(),
  userId: z.string().optional(),
  description: z.string().optional()
})
)
