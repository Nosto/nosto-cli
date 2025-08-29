import { getCachedConfig } from "#config/config.ts"

export function getSourceUrl(path: string) {
  const config = getCachedConfig()
  const merchant = config.merchant
  const env = config.templatesEnv
  const replacedPath = path.replace("{env}", env)
  return `${config.apiUrl}/${merchant}/search-templates/${replacedPath}`
}

export function getHeaders() {
  return new Headers({
    "Content-Type": "application/octet-stream"
  })
}

export function getJsonHeaders() {
  return new Headers({
    "Content-Type": "application/json"
  })
}

// Remove trailing and leading slashes
export function cleanUrl(url: string) {
  return url.replace(/^\/+|\/+$/g, "")
}
