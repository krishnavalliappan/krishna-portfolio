import { execFile } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { resolve } from "node:path"
import { promisify } from "node:util"
import { z } from "zod"

import { aggregateProfiles } from "../src/features/codex-activity/aggregate"
import {
  codexAuthSchema,
  tokenUsageProfileSchema,
} from "../src/features/codex-activity/openai-profile.schema"
import { signActivity } from "../src/features/codex-activity/signature"

const configSchema = z.object({
  endpoint: z.url(),
  profiles: z.array(z.string().min(1)).min(1),
})

const dryRun = process.argv.includes("--dry-run")
const configPath =
  process.env.CODEX_SYNC_CONFIG ?? resolve("scripts/codex-sync.config.json")
const statePath = resolve(homedir(), ".codex/portfolio-sync-state.json")

try {
  const config = configSchema.parse(
    JSON.parse(await readFile(configPath, "utf8"))
  )
  const profiles = await Promise.all(config.profiles.map(fetchProfile))
  const snapshot = aggregateProfiles(profiles)

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          profileCount: profiles.length,
          collectedAt: snapshot.collectedAt,
          dailyBuckets: snapshot.daily.length,
          lifetimeTokens: snapshot.lifetimeTokens,
        },
        null,
        2
      )
    )
  } else {
    const body = JSON.stringify(snapshot)
    const timestamp = new Date().toISOString()
    const secret = await getSyncSecret()

    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-sync-timestamp": timestamp,
        "x-sync-signature": signActivity(timestamp, body, secret),
      },
      body,
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) throw new Error(`Ingest returned HTTP ${response.status}`)
    console.log(
      `Published ${snapshot.daily.length} anonymous daily buckets from ${profiles.length} profiles`
    )
  }

  await writeState({ failures: 0, notified: false })
} catch (error) {
  const state = await readState()
  const next = { failures: state.failures + 1, notified: state.notified }
  if (next.failures >= 3 && !next.notified && process.platform === "darwin") {
    await promisify(execFile)("osascript", [
      "-e",
      'display notification "Codex portfolio sync has failed three times." with title "Portfolio sync paused"',
    ])
    next.notified = true
  }
  await writeState(next)
  console.error(
    `Codex sync failed: ${error instanceof Error ? error.message : "Unknown error"}`
  )
  process.exitCode = 1
}

async function fetchProfile(path: string) {
  const resolvedPath = path.replace(/^\$HOME|^~/, homedir())
  const auth = codexAuthSchema.parse(
    JSON.parse(await readFile(resolvedPath, "utf8"))
  )
  const headers: Record<string, string> = {
    authorization: `Bearer ${auth.tokens.access_token}`,
    "user-agent": "krishna-portfolio-codex-sync/1.0",
  }
  if (auth.tokens.account_id)
    headers["chatgpt-account-id"] = auth.tokens.account_id

  const response = await fetch(
    "https://chatgpt.com/backend-api/wham/profiles/me",
    {
      headers,
      signal: AbortSignal.timeout(10_000),
    }
  )
  if (!response.ok)
    throw new Error(`Profile request returned HTTP ${response.status}`)
  return tokenUsageProfileSchema.parse(await response.json())
}

async function readState(): Promise<{ failures: number; notified: boolean }> {
  try {
    return z
      .object({
        failures: z.number().int().nonnegative(),
        notified: z.boolean(),
      })
      .parse(JSON.parse(await readFile(statePath, "utf8")))
  } catch {
    return { failures: 0, notified: false }
  }
}

async function writeState(state: { failures: number; notified: boolean }) {
  await writeFile(statePath, JSON.stringify(state), { mode: 0o600 })
}

async function getSyncSecret() {
  if (process.env.CODEX_SYNC_SECRET) return process.env.CODEX_SYNC_SECRET
  if (process.platform !== "darwin")
    throw new Error("CODEX_SYNC_SECRET is required")

  const { stdout } = await promisify(execFile)("security", [
    "find-generic-password",
    "-a",
    "codex-sync",
    "-s",
    "portfolio-sync-secret",
    "-w",
  ])
  return stdout.trim()
}
