/**
 * Formats a date as YYYY-MM-DD HH:mm in UTC
 * @param date - Date to format (timestamp in milliseconds or Date object)
 * @returns Formatted date string in UTC (e.g., "2025-10-10 17:33")
 * @note Always uses UTC to ensure consistent display across timezones
 */
export function formatDate(date: number | Date): string {
  const d = typeof date === "number" ? new Date(date) : date

  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  const hours = String(d.getUTCHours()).padStart(2, "0")
  const minutes = String(d.getUTCMinutes()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}`
}
