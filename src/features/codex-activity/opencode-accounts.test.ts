import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, describe, expect, it, vi } from "vitest"

import { ensureFreshOpenCodeAccounts } from "./opencode-accounts"

const paths: string[] = []
const now = Date.parse("2026-07-21T12:00:00.000Z")

async function store(accounts: unknown[], version = 3) {
  const directory = await mkdtemp(join(tmpdir(), "opencode-accounts-"))
  paths.push(directory)
  const path = join(directory, "accounts.json")
  await writeFile(path, JSON.stringify({ version, accounts }))
  return path
}

function account(overrides: Record<string, unknown> = {}) {
  return {
    accountId: "account-id",
    accessToken: "access-token",
    expiresAt: now + 60 * 60 * 1000,
    ...overrides,
  }
}

afterEach(async () => {
  await Promise.all(
    paths.splice(0).map((path) => rm(path, { recursive: true }))
  )
})

describe("ensureFreshOpenCodeAccounts", () => {
  it("loads enabled accounts and excludes disabled accounts", async () => {
    const path = await store([account(), account({ enabled: false })])

    await expect(
      ensureFreshOpenCodeAccounts(path, vi.fn(), now)
    ).resolves.toEqual([
      {
        accountId: "account-id",
        accessToken: "access-token",
        expiresAt: now + 60 * 60 * 1000,
      },
    ])
  })

  it("rejects unsupported stores and malformed enabled accounts", async () => {
    const oldStore = await store([account()], 2)
    const malformedStore = await store([account({ accessToken: undefined })])

    await expect(
      ensureFreshOpenCodeAccounts(oldStore, vi.fn(), now)
    ).rejects.toThrow("Unsupported OpenCode account store version")
    await expect(
      ensureFreshOpenCodeAccounts(malformedStore, vi.fn(), now)
    ).rejects.toThrow("OpenCode account 0 is malformed")
  })

  it("rejects whitespace-only credentials", async () => {
    const blankAccountId = await store([account({ accountId: " " })])
    const blankAccessToken = await store([account({ accessToken: " " })])

    await expect(
      ensureFreshOpenCodeAccounts(blankAccountId, vi.fn(), now)
    ).rejects.toThrow("OpenCode account 0 is malformed")
    await expect(
      ensureFreshOpenCodeAccounts(blankAccessToken, vi.fn(), now)
    ).rejects.toThrow("OpenCode account 0 is malformed")
  })

  it("rejects a store without enabled accounts", async () => {
    const path = await store([account({ enabled: false })])

    await expect(
      ensureFreshOpenCodeAccounts(path, vi.fn(), now)
    ).rejects.toThrow("OpenCode account store has no enabled accounts")
  })

  it("reloads credentials after refreshing an expiring account", async () => {
    const path = await store([account({ expiresAt: now })])
    const refresh = vi.fn(async () => {
      await writeFile(
        path,
        JSON.stringify({ version: 3, accounts: [account()] })
      )
    })

    await expect(
      ensureFreshOpenCodeAccounts(path, refresh, now)
    ).resolves.toHaveLength(1)
    expect(refresh).toHaveBeenCalledOnce()
  })

  it("accepts refreshed credentials when the warm command exits nonzero", async () => {
    const path = await store([account({ expiresAt: now })])
    const warn = vi.fn()
    const refresh = vi.fn(async () => {
      await writeFile(
        path,
        JSON.stringify({ version: 3, accounts: [account()] })
      )
      throw new Error("Warm request failed: HTTP 400")
    })

    await expect(
      ensureFreshOpenCodeAccounts(path, refresh, now, warn)
    ).resolves.toHaveLength(1)
    expect(warn).toHaveBeenCalledWith(
      "OpenCode credential refresh command failed; validating reloaded credentials"
    )
  })

  it("rejects credentials that remain expired after refresh", async () => {
    const path = await store([account({ expiresAt: now })])

    await expect(
      ensureFreshOpenCodeAccounts(path, vi.fn(), now)
    ).rejects.toThrow("OpenCode account 0 credentials remain expired")
  })

  it("does not refresh current credentials", async () => {
    const path = await store([account()])
    const refresh = vi.fn()

    await ensureFreshOpenCodeAccounts(path, refresh, now)

    expect(refresh).not.toHaveBeenCalled()
  })
})
