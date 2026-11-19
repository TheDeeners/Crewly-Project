/**
 * Get today's date in Bangkok timezone as a "YYYY-MM-DD" string.
 * We use Intl.DateTimeFormat instead of a third-party library.
 */
export function getTodayBangkok(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  // en-CA locale formats as YYYY-MM-DD natively
  return formatter.format(new Date())
}

/**
 * Count the number of working days between startDate and endDate (inclusive).
 * Rules:
 *   - Skip Saturday (day 6) and Sunday (day 0)
 *   - Skip dates that appear in the holidayDates set
 *
 * @param startDate    - "YYYY-MM-DD" string
 * @param endDate      - "YYYY-MM-DD" string
 * @param holidayDates - Set of "YYYY-MM-DD" strings for company holidays
 * @returns number of working days
 */
export function countWorkingDays(
  startDate: string,
  endDate: string,
  holidayDates: Set<string>
): number {
  let count = 0
  // Parse dates — adding T00:00:00 avoids timezone shift from UTC midnight
  const current = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  while (current <= end) {
    const dayOfWeek = current.getDay() // 0 = Sunday, 6 = Saturday
    const dateStr = current.toISOString().slice(0, 10) // "YYYY-MM-DD"

    // Only count if it's a weekday and not a holiday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isHoliday = holidayDates.has(dateStr)

    if (!isWeekend && !isHoliday) {
      count++
    }

    // Move to the next day
    current.setDate(current.getDate() + 1)
  }

  return count
}
