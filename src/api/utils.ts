import { getCachedConfig } from "../config/config.ts"

export function getUrl(path: string) {
  const config = getCachedConfig()
  const merchant = config.merchant
  const env = config.templatesEnv
  const baseUrl = config.apiUrl.endsWith("/") ? config.apiUrl.slice(0, -1) : config.apiUrl
  const replacedPath = path.replace("{env}", env)
  return `${baseUrl}/api/${merchant}/search-templates/${replacedPath}`
}

export function getHeaders() {
  const config = getCachedConfig()
  return new Headers({
    "Content-Type": "application/octet-stream",
    Authorization: "Basic " + btoa(":" + config.apiKey)
  })
}

export function getJsonHeaders() {
  const config = getCachedConfig()
  return new Headers({
    "Content-Type": "application/json",
    Authorization: "Basic " + btoa(":" + config.apiKey)
  })
}
