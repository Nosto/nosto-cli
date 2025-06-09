import ky from "ky"

export async function fetchTemplates(_) {
  const merchant = "abyyn4de"
  const token = "ISGGkSt1j2dNsIIjYotutilZfd7XINCZ4cgOwT8eCoPQMM6BgLEm7BDk8sBY1BqE"
  const env = "main"
  const url = `https://my.dev.nos.to/admin/${merchant}/legacy-templates/api/source/${env}`
  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: "Basic " + btoa(":" + token)
  })
  const json = await ky.get(url, { headers }).json()
  console.log(json)
}
