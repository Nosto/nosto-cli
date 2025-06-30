import { getCachedConfig } from "../config/config.ts"

export function getSourceUrl(path: string) {
  const config = getCachedConfig()
  const merchant = config.merchant
  const env = config.templatesEnv
  const replacedPath = path.replace("{env}", env)
  return `${config.apiUrl}/${merchant}/search-templates/${replacedPath}`
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

// Remove trailing and leading slashes
export function cleanUrl(url: string) {
  return url.replace(/^\/+|\/+$/g, "")
}
