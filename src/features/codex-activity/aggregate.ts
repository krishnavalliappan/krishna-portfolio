import type { ActivitySnapshot } from "./activity.schema"
import type { TokenUsageProfile } from "./openai-profile.schema"

export function aggregateProfiles(
  profiles: readonly TokenUsageProfile[],
  collectedAt = new Date().toISOString()
): ActivitySnapshot {
  if (!profiles.length) throw new Error("At least one profile is required")

  const byDate = new Map<string, number>()
  let lifetimeTokens = 0

  for (const profile of profiles) {
    lifetimeTokens += profile.stats.lifetime_tokens ?? 0
    for (const bucket of profile.stats.daily_usage_buckets ?? []) {
      byDate.set(
        bucket.start_date,
        (byDate.get(bucket.start_date) ?? 0) + bucket.tokens
      )
    }
  }

  const daily = [...byDate]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, tokens]) => ({ date, tokens }))
  const streaks = calculateStreaks(
    daily.filter((day) => day.tokens > 0).map((day) => day.date),
    collectedAt
  )

  return {
    version: 1,
    collectedAt,
    lifetimeTokens,
    peakDailyTokens: Math.max(0, ...daily.map((day) => day.tokens)),
    ...streaks,
    daily,
  }
}

function calculateStreaks(dates: readonly string[], collectedAt: string) {
  let longestStreakDays = 0
  let streak = 0
  let previous: number | undefined

  for (const date of dates) {
    const current = Date.parse(`${date}T00:00:00Z`) / 86_400_000
    streak = previous !== undefined && current === previous + 1 ? streak + 1 : 1
    longestStreakDays = Math.max(longestStreakDays, streak)
    previous = current
  }

  const collectedDay =
    Date.parse(`${collectedAt.slice(0, 10)}T00:00:00Z`) / 86_400_000
  const daysSinceActivity =
    previous === undefined ? Number.POSITIVE_INFINITY : collectedDay - previous
  const currentStreakDays =
    daysSinceActivity >= 0 && daysSinceActivity <= 1 ? streak : 0
  return { currentStreakDays, longestStreakDays }
}
