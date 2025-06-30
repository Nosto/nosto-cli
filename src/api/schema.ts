import z from "zod"

export const ListSourceFilesSchema = z.array(
  z.object({
    path: z.string(),
    size: z.number()
  })
)

export const ListLibraryFilesSchema = ListSourceFilesSchema
