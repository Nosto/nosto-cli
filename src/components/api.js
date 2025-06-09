/**
 * Ugly POC API, please ignore
 */

import ky from "ky"

function getUrl(path) {
  const merchant = "abyyn4de"
  const env = "main"
  const replacedPath = path.replace("{env}", env)
  return `https://my.dev.nos.to/admin/${merchant}/legacy-templates/api/${replacedPath}`
}

const token = "ISGGkSt1j2dNsIIjYotutilZfd7XINCZ4cgOwT8eCoPQMM6BgLEm7BDk8sBY1BqE"
function getHeaders() {
  return new Headers({
    "Content-Type": "application/octet-stream",
    Authorization: "Basic " + btoa(":" + token)
  })
}

function getJsonHeaders() {
  return new Headers({
    "Content-Type": "application/json",
    Authorization: "Basic " + btoa(":" + token)
  })
}

export async function fetchSourceList() {
  const files = await ky.get(getUrl("source/{env}"), { headers: getJsonHeaders() }).json()
  return files.filter(file => file.path && !file.path.startsWith("build/"))
}

export async function fetchSourceFile(path) {
  const data = await ky.get(getUrl(`source/{env}/${path}`), { headers: getJsonHeaders() }).text()
  // console.log(data)
  return data
}

export async function putSourceFile(path, data) {
  // Send as binary data
  const response = await ky.put(getUrl(`source/{env}/${path}`), {
    headers: getHeaders(),
    body: data
  })
  if (!response.ok) {
    throw new Error(`Failed to put source file: ${response.statusText}`)
  }
  return response.json()
}
