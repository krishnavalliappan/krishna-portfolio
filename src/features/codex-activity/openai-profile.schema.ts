import { z } from "zod"

export const tokenUsageProfileSchema = z.object({
  stats: z.object({
    lifetime_tokens: z.number().int().nonnegative().nullish(),
    peak_daily_tokens: z.number().int().nonnegative().nullish(),
    current_streak_days: z.number().int().nonnegative().nullish(),
    longest_streak_days: z.number().int().nonnegative().nullish(),
    daily_usage_buckets: z
      .array(
        z.object({
          start_date: z.iso.date(),
          tokens: z.number().int().nonnegative(),
        })
      )
      .nullish(),
  }),
})

export const codexAuthSchema = z.object({
  tokens: z.object({
    access_token: z.string().min(1),
    account_id: z.string().min(1).optional(),
  }),
})

export type TokenUsageProfile = z.infer<typeof tokenUsageProfileSchema>
