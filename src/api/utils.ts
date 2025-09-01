import { getCachedConfig } from "#config/config.ts"

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
    "X-Nosto-User": config.auth.user,
    "X-Nosto-Token": config.auth.token
  })
}

export function getJsonHeaders() {
  const config = getCachedConfig()
  return new Headers({
    "Content-Type": "application/json",
    "X-Nosto-User": config.auth.user,
    "X-Nosto-Token": config.auth.token
  })
}

// Remove trailing and leading slashes
export function cleanUrl(url: string) {
  return url.replace(/^\/+|\/+$/g, "")
}
