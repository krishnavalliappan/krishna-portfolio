# OpenCode credential sync implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hourly portfolio collector use and renew OpenCode's canonical three-account credentials instead of stale Codex auth copies.

**Architecture:** A focused credential loader reads OpenCode account-store version 3, filters disabled accounts, invokes the installed plugin's public `warm` command when any enabled token is near expiry, then reloads and validates the store. The collector consumes the validated accounts and keeps its existing all-or-nothing publish behavior.

**Tech stack:** TypeScript 6, Node.js, Zod 4, Vitest 4, pnpm 10, `oc-codex-multi-auth` 6.10.0.

## Global constraints

- The OpenCode store is the only credential source.
- The collector never writes the OpenCode store.
- Refresh tokens, access tokens, email addresses, and account IDs never enter logs.
- All enabled accounts must validate and fetch successfully before publication.
- The launch agent remains hourly.

---

### Task 1: OpenCode credential loader

**Files:**
- Create: `src/features/codex-activity/opencode-accounts.ts`
- Test: `src/features/codex-activity/opencode-accounts.test.ts`

**Interfaces:**
- Produces: `type OpenCodeAccount = { accountId: string; accessToken: string; expiresAt: number }`
- Produces: `ensureFreshOpenCodeAccounts(path: string, refresh: () => Promise<void>, now?: number): Promise<OpenCodeAccount[]>`
- Contract: disabled records are excluded; store version must equal `3`; at least one enabled record is required; tokens expiring within five minutes trigger refresh; the loader always rereads after a refresh attempt; stale credentials after reread throw an index-only error.

- [ ] **Step 1: Write failing schema and valid-store tests**

Create fixtures through a temporary JSON file. Assert that version 3 loads enabled accounts, excludes `enabled: false`, rejects another version, rejects malformed enabled records, and rejects a store with no enabled accounts.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `pnpm vitest run src/features/codex-activity/opencode-accounts.test.ts`

Expected: FAIL because `./opencode-accounts` does not exist.

- [ ] **Step 3: Implement store parsing**

Define Zod schemas for the version 3 envelope and account records. Expand a leading `$HOME` or `~` with `homedir()`. Return only enabled accounts mapped to `accountId`, `accessToken`, and `expiresAt`. Error messages may contain only the record index and field name.

- [ ] **Step 4: Add failing refresh tests**

Cover these observable cases:

```ts
it("reloads credentials after refreshing an expiring account", async () => {})
it("accepts refreshed credentials even when the warm command exits nonzero", async () => {})
it("rejects credentials that remain expired after refresh", async () => {})
it("does not refresh current credentials", async () => {})
```

The second test makes the refresh callback update the fixture and then reject. The loader must reread, accept the fresh fixture, and expose the refresh error only through an index-safe warning callback.

- [ ] **Step 5: Implement refresh-on-expiry**

Use a five-minute expiry margin. If refresh throws, retain its sanitized message, reread the store, and decide from the reloaded credentials. Throw if any enabled account remains stale. Return all current enabled accounts otherwise.

- [ ] **Step 6: Run the focused tests and confirm GREEN**

Run: `pnpm vitest run src/features/codex-activity/opencode-accounts.test.ts`

Expected: all credential-loader tests pass.

- [ ] **Step 7: Commit the loader**

```bash
git add src/features/codex-activity/opencode-accounts.ts src/features/codex-activity/opencode-accounts.test.ts
git commit -m "feat: load OpenCode sync credentials"
```

---

### Task 2: Collector cutover and live scheduler recovery

**Files:**
- Modify: `scripts/sync-codex-usage.ts`
- Modify: `scripts/codex-sync.config.json`
- Modify: `scripts/codex-sync.config.example.json`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `docs/operations/codex-sync.md`

**Interfaces:**
- Consumes: `ensureFreshOpenCodeAccounts(path, refresh)` from Task 1.
- Configuration: `{ endpoint: string; accountStore: string }`.
- Refresh command: `oc-codex-multi-auth warm --json` through `execFile`.

- [ ] **Step 1: Add the pinned plugin dependency**

Run: `pnpm add -D -E oc-codex-multi-auth@6.10.0`

Expected: `package.json` contains exact version `6.10.0`; lockfile resolves the package.

- [ ] **Step 2: Cut configuration over to OpenCode storage**

Replace `profiles` in both config files with:

```json
"accountStore": "$HOME/.opencode/oc-codex-multi-auth-accounts.json"
```

Keep each file's existing endpoint.

- [ ] **Step 3: Integrate the credential loader**

Change `configSchema` to require `accountStore`. Call `ensureFreshOpenCodeAccounts` before profile collection. The refresh callback invokes `oc-codex-multi-auth warm --json`. Change `fetchProfile` to accept `OpenCodeAccount`, use `accessToken` for the bearer token, and use `accountId` for `chatgpt-account-id`. Keep `Promise.all`, response timeouts, schema parsing, signing, publication, failure counting, and notifications unchanged.

- [ ] **Step 4: Update the operations guide**

State that OpenCode's multi-account store is canonical, the collector refreshes near-expiry credentials through the pinned plugin, copied `~/.codex/accounts` files are no longer used, and OpenCode login is the recovery path for a revoked refresh token.

- [ ] **Step 5: Run permanent checks**

Run:

```bash
pnpm test
pnpm typecheck
pnpm lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Smoke-test all three live profiles without publishing**

Run: `pnpm codex:sync -- --dry-run`

Expected: JSON reports `profileCount: 3` and exits 0 without exposing account data.

- [ ] **Step 7: Publish and verify freshness**

Run: `pnpm codex:sync`.

Read `https://www.krishnakumar.dev/api/codex-activity` and confirm `collectedAt` is newer than `2026-07-18T17:29:35.399Z`.

- [ ] **Step 8: Verify the launch agent path**

Run:

```bash
launchctl kickstart -k gui/501/com.krishnakumar.codex-sync
launchctl print gui/501/com.krishnakumar.codex-sync
```

Expected: the run count increases and `last exit code = 0` after completion.

- [ ] **Step 9: Commit the cutover**

```bash
git add scripts/sync-codex-usage.ts scripts/codex-sync.config.json scripts/codex-sync.config.example.json package.json pnpm-lock.yaml docs/operations/codex-sync.md
git commit -m "fix: keep portfolio sync credentials fresh"
```
