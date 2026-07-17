export type Metric = "tokens" | "contributions"

/**
 * K/M/B rather than full digits. Daily token counts span three orders of
 * magnitude, and while scanning the grid the magnitude is the readable part —
 * nobody compares 3,382,855 against 12,847,201 at a glance.
 */
export function compactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export type HeatmapDay = {
  date: string
  tokens: number
  /** null when the GitHub sync is unconfigured or that day predates it. */
  contributions: number | null
}

/** A grid slot: either a real day, or padding before the first day. */
export type CalendarCell = { index: number; day: HeatmapDay } | null

export function valueOf(day: HeatmapDay, metric: Metric): number {
  return metric === "tokens" ? day.tokens : (day.contributions ?? 0)
}

/**
 * Weeks as columns, weekdays as rows, Sunday first. The leading pad keeps row 0
 * on a Sunday no matter which weekday the range opens on, so the rows stay
 * readable as weekdays rather than drifting.
 */
export function buildWeeks(days: readonly HeatmapDay[]): CalendarCell[][] {
  if (!days.length) return []

  const lead = new Date(`${days[0].date}T00:00:00Z`).getUTCDay()
  const cells: CalendarCell[] = [
    ...Array.from({ length: lead }, () => null),
    ...days.map((day, index) => ({ index, day })),
  ]

  const weeks: CalendarCell[][] = []
  for (let start = 0; start < cells.length; start += 7) {
    const week = cells.slice(start, start + 7)
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/**
 * One label per month, anchored to the week the month opens in. Months whose
 * first week sits within two columns of the previous label are dropped, since
 * the text would collide.
 */
export function monthLabels(weeks: readonly CalendarCell[][]) {
  const labels: { index: number; label: string }[] = []
  let previousMonth = -1

  weeks.forEach((week, index) => {
    const first = week.find((cell) => cell !== null)
    if (!first) return

    const month = new Date(`${first.day.date}T00:00:00Z`).getUTCMonth()
    if (month === previousMonth) return
    previousMonth = month

    const last = labels.at(-1)
    if (last && index - last.index < 3) return
    labels.push({ index, label: MONTHS[month] })
  })

  return labels
}

/**
 * Quartile cut points over the active days only. A linear scale against the
 * peak collapses the whole year to invisible the moment one outlier day lands,
 * which is exactly what token counts do.
 */
export function buildThresholds(
  values: readonly number[]
): readonly [number, number, number] {
  const active = values.filter((value) => value > 0).sort((a, b) => a - b)
  if (!active.length) return [0, 0, 0]
  return [quantile(active, 0.25), quantile(active, 0.5), quantile(active, 0.75)]
}

function quantile(sorted: readonly number[], fraction: number) {
  return sorted[
    Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))
  ]
}

export function levelOf(
  value: number,
  thresholds: readonly [number, number, number]
): 0 | 1 | 2 | 3 | 4 {
  if (value <= 0) return 0
  if (value <= thresholds[0]) return 1
  if (value <= thresholds[1]) return 2
  if (value <= thresholds[2]) return 3
  return 4
}

/**
 * Window summary for whichever metric is on screen. Codex ships its own
 * lifetime totals from the collector; GitHub counts have to be summarised here,
 * since the contributions query only returns the calendar itself.
 */
export function summarize(days: readonly HeatmapDay[], metric: Metric) {
  const values = days.map((day) => valueOf(day, metric))
  let longestStreak = 0
  let streak = 0

  for (const value of values) {
    streak = value > 0 ? streak + 1 : 0
    longestStreak = Math.max(longestStreak, streak)
  }

  return {
    total: values.reduce((sum, value) => sum + value, 0),
    activeDays: values.filter((value) => value > 0).length,
    longestStreak,
  }
}

/**
 * The most recent day with activity, for the inspector's resting state. Today
 * is usually still empty — the collector runs on a schedule, and GitHub is
 * quiet until the first push — so anchoring to the last cell would greet every
 * visitor with a row of zeroes.
 */
export function lastActiveIndex(
  days: readonly HeatmapDay[],
  metric: Metric
): number {
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (valueOf(days[index], metric) > 0) return index
  }
  return Math.max(0, days.length - 1)
}

/**
 * Today in the viewer's own timezone. The grid ends here rather than at the
 * last sync, so a collector that has not run yet reads as empty recent days
 * instead of silently truncating the calendar. The freshness badge is what
 * reports sync lag.
 */
export function todayIso(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

/**
 * Builds a dense, contiguous window ending on `endDate` and merges both
 * sources into it.
 *
 * Density is not cosmetic: neither source emits a row for a day with no
 * activity, and the grid derives every cell's weekday from its position, so a
 * single missing date would slide the rest of the year onto the wrong weekday.
 */
export function buildWindow(
  tokens: readonly { date: string; tokens: number }[],
  contributions: readonly { date: string; contributions: number }[] | null,
  endDate: string,
  length = 365
): HeatmapDay[] {
  const tokensByDate = new Map(tokens.map((day) => [day.date, day.tokens]))
  const contributionsByDate = new Map(
    (contributions ?? []).map((day) => [day.date, day.contributions])
  )
  const end = Date.parse(`${endDate}T00:00:00Z`)
  if (!Number.isFinite(end)) return []

  return Array.from({ length }, (_, offset) => {
    const date = new Date(end - (length - 1 - offset) * 86_400_000)
      .toISOString()
      .slice(0, 10)
    return {
      date,
      tokens: tokensByDate.get(date) ?? 0,
      contributions: contributions
        ? (contributionsByDate.get(date) ?? 0)
        : null,
    }
  })
}
