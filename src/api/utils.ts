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
    "Content-Type": "application/octet-stream",
    ...getAuthHeaders()
  })
}

export function getJsonHeaders() {
  return new Headers({
    "Content-Type": "application/json",
    ...getAuthHeaders()
  })
}

type AuthHeaders =
  | {
      Authorization: string
    }
  | {
      "X-Nosto-User": string
      "X-Nosto-Token": string
      "X-Nosto-Merchant": string
    }

function getAuthHeaders(): AuthHeaders {
  const config = getCachedConfig()
  if (config.apiKey) {
    return {
      Authorization: "Basic " + btoa(":" + config.apiKey)
    }
  }
  return {
    "X-Nosto-User": config.auth.user,
    "X-Nosto-Token": config.auth.token,
    "X-Nosto-Merchant": config.merchant
  }
}

// Remove trailing and leading slashes
export function cleanUrl(url: string) {
  return url.replace(/^\/+|\/+$/g, "")
}
