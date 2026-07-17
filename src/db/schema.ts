import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const codexDailyActivity = sqliteTable("codex_daily_activity", {
  date: text("date").primaryKey(),
  tokens: integer("tokens").notNull(),
})

export const codexActivitySummary = sqliteTable("codex_activity_summary", {
  id: integer("id").primaryKey(),
  lifetimeTokens: integer("lifetime_tokens").notNull(),
  peakDailyTokens: integer("peak_daily_tokens").notNull(),
  currentStreakDays: integer("current_streak_days").notNull(),
  longestStreakDays: integer("longest_streak_days").notNull(),
  collectedAt: text("collected_at").notNull(),
})
