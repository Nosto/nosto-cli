import ky from "ky"
import { getJsonHeaders, getUrl } from "./utils.ts"
import { ListSourceFilesSchema } from "./schema.ts"

export async function listSourceFiles() {
  const response = await ky.get(getUrl("source/{env}"), { headers: getJsonHeaders() })
  const files = ListSourceFilesSchema.parse(await response.json())
  return files.filter(file => file.path && !file.path.startsWith("build/"))
}
