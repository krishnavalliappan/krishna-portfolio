import { z } from "zod"

export const dailyActivitySchema = z.object({
  date: z.iso.date(),
  tokens: z.number().int().nonnegative(),
})

export const activitySnapshotSchema = z.object({
  version: z.literal(1),
  collectedAt: z.iso.datetime({ offset: true }),
  lifetimeTokens: z.number().int().nonnegative(),
  peakDailyTokens: z.number().int().nonnegative(),
  currentStreakDays: z.number().int().nonnegative(),
  longestStreakDays: z.number().int().nonnegative(),
  daily: z.array(dailyActivitySchema).max(4000),
})

export type ActivitySnapshot = z.infer<typeof activitySnapshotSchema>

export type PublicActivity =
  { status: "empty" } | ({ status: "ok" } & ActivitySnapshot)
