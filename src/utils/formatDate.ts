/**
 * Formats a date as YYYY-MM-DD HH:mm
 * @param date - Date to format (timestamp in milliseconds or Date object)
 * @returns Formatted date string (e.g., "2025-10-10 17:33")
 */
export function formatDate(date: number | Date): string {
  const d = typeof date === "number" ? new Date(date) : date

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}`
}
