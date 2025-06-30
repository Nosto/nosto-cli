import { getJsonHeaders, getUrl } from "./utils.ts"
import { ListLibraryFilesSchema } from "./schema.ts"
import ky from "ky"

export async function listLibraryFiles() {
  const response = await ky.get(getUrl("library/{env}"), { headers: getJsonHeaders() })
  const files = ListLibraryFilesSchema.parse(await response.json())
  return files
}
