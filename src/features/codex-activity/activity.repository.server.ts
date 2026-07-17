import { asc, eq } from "drizzle-orm"

import { getDb } from "@/db/client.server"
import { codexActivitySummary, codexDailyActivity } from "@/db/schema"

import { activitySnapshotSchema } from "./activity.schema"
import type { ActivitySnapshot, PublicActivity } from "./activity.schema"

export async function readActivity(): Promise<PublicActivity> {
  const db = getDb()
  const summary = (
    await db
      .select()
      .from(codexActivitySummary)
      .where(eq(codexActivitySummary.id, 1))
  ).at(0)
  if (!summary) return { status: "empty" }

  const daily = await db
    .select()
    .from(codexDailyActivity)
    .orderBy(asc(codexDailyActivity.date))
  return {
    status: "ok",
    ...activitySnapshotSchema.parse({ version: 1, ...summary, daily }),
  }
}

export async function replaceActivity(snapshot: ActivitySnapshot) {
  const db = getDb()

  await db.transaction(async (tx) => {
    await tx.delete(codexDailyActivity)
    for (let index = 0; index < snapshot.daily.length; index += 250) {
      await tx
        .insert(codexDailyActivity)
        .values(snapshot.daily.slice(index, index + 250))
    }
    await tx
      .insert(codexActivitySummary)
      .values({
        id: 1,
        lifetimeTokens: snapshot.lifetimeTokens,
        peakDailyTokens: snapshot.peakDailyTokens,
        currentStreakDays: snapshot.currentStreakDays,
        longestStreakDays: snapshot.longestStreakDays,
        collectedAt: snapshot.collectedAt,
      })
      .onConflictDoUpdate({
        target: codexActivitySummary.id,
        set: {
          lifetimeTokens: snapshot.lifetimeTokens,
          peakDailyTokens: snapshot.peakDailyTokens,
          currentStreakDays: snapshot.currentStreakDays,
          longestStreakDays: snapshot.longestStreakDays,
          collectedAt: snapshot.collectedAt,
        },
      })
  })
}
