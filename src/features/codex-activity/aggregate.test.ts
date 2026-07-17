import { describe, expect, it } from "vitest"

import { aggregateProfiles } from "./aggregate"
import type { TokenUsageProfile } from "./openai-profile.schema"

const profile = (
  lifetime: number,
  buckets: [string, number][]
): TokenUsageProfile => ({
  stats: {
    lifetime_tokens: lifetime,
    peak_daily_tokens: null,
    current_streak_days: null,
    longest_streak_days: null,
    daily_usage_buckets: buckets.map(([start_date, tokens]) => ({
      start_date,
      tokens,
    })),
  },
})

describe("aggregateProfiles", () => {
  it("combines profiles by UTC date and recomputes summary values", () => {
    const result = aggregateProfiles(
      [
        profile(100, [
          ["2026-07-13", 40],
          ["2026-07-14", 60],
        ]),
        profile(75, [
          ["2026-07-14", 25],
          ["2026-07-15", 50],
        ]),
      ],
      "2026-07-15T12:00:00.000Z"
    )

    expect(result.lifetimeTokens).toBe(175)
    expect(result.peakDailyTokens).toBe(85)
    expect(result.currentStreakDays).toBe(3)
    expect(result.daily).toEqual([
      { date: "2026-07-13", tokens: 40 },
      { date: "2026-07-14", tokens: 85 },
      { date: "2026-07-15", tokens: 50 },
    ])
  })

  it("does not report an old streak as current", () => {
    const result = aggregateProfiles(
      [profile(100, [["2026-07-10", 100]])],
      "2026-07-15T12:00:00.000Z"
    )

    expect(result.currentStreakDays).toBe(0)
    expect(result.longestStreakDays).toBe(1)
  })
})
