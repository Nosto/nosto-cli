import ky from "ky"
import { getJsonHeaders, getUrl } from "./utils.ts"
import z from "zod"

const ListSourceFilesSchema = z.array(
  z.object({
    path: z.string(),
    size: z.number()
  })
)

export async function listSourceFiles() {
  const response = await ky.get(getUrl("source/{env}"), { headers: getJsonHeaders() })
  if (!response.ok) {
    throw new Error(`Failed to list source files: ${response.statusText}`)
  }
  const files = ListSourceFilesSchema.parse(await response.json())
  return files.filter(file => file.path && !file.path.startsWith("build/"))
}
