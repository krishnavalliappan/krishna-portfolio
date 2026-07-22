import { readFile } from "node:fs/promises"
import { homedir } from "node:os"

import { z } from "zod"

const expiryMarginMs = 5 * 60 * 1000

const accountStoreSchema = z.object({
  version: z.number().int(),
  accounts: z.array(z.unknown()),
})

const accountStateSchema = z.object({
  enabled: z.boolean().optional(),
})

const enabledAccountSchema = z.object({
  accountId: z.string().trim().min(1),
  accessToken: z.string().trim().min(1),
  expiresAt: z.number(),
})

export type OpenCodeAccount = z.infer<typeof enabledAccountSchema>

export async function ensureFreshOpenCodeAccounts(
  path: string,
  refresh: () => Promise<void>,
  now = Date.now(),
  warn: (message: string) => void = console.warn
): Promise<OpenCodeAccount[]> {
  let accounts = await readEnabledAccounts(path)
  if (!accounts.some((account) => isExpiring(account, now))) return accounts

  try {
    await refresh()
  } catch {
    warn(
      "OpenCode credential refresh command failed; validating reloaded credentials"
    )
  }

  accounts = await readEnabledAccounts(path)
  const staleIndex = accounts.findIndex((account) => isExpiring(account, now))
  if (staleIndex !== -1)
    throw new Error(
      `OpenCode account ${staleIndex} credentials remain expired after refresh`
    )

  return accounts
}

async function readEnabledAccounts(path: string): Promise<OpenCodeAccount[]> {
  const resolvedPath = path.replace(/^\$HOME|^~/, homedir())
  let input: unknown
  try {
    input = JSON.parse(await readFile(resolvedPath, "utf8"))
  } catch {
    throw new Error("Unable to read OpenCode account store")
  }

  const store = accountStoreSchema.safeParse(input)
  if (!store.success) throw new Error("OpenCode account store is malformed")
  if (store.data.version !== 3)
    throw new Error("Unsupported OpenCode account store version")

  const accounts: OpenCodeAccount[] = []
  for (const [index, inputAccount] of store.data.accounts.entries()) {
    const state = accountStateSchema.safeParse(inputAccount)
    if (!state.success)
      throw new Error(`OpenCode account ${index} is malformed`)
    if (state.data.enabled === false) continue

    const account = enabledAccountSchema.safeParse(inputAccount)
    if (!account.success)
      throw new Error(`OpenCode account ${index} is malformed`)
    accounts.push(account.data)
  }

  if (!accounts.length)
    throw new Error("OpenCode account store has no enabled accounts")
  return accounts
}

function isExpiring(account: OpenCodeAccount, now: number) {
  return account.expiresAt <= now + expiryMarginMs
}
