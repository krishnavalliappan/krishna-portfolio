# OpenCode credential sync design

## Problem

The hourly portfolio collector reads three copied Codex auth files under `~/.codex/accounts/`. OpenCode uses and refreshes a different store at `~/.opencode/oc-codex-multi-auth-accounts.json`. The copied access tokens expired on July 18 and July 20, 2026, while OpenCode continued updating its own credentials. The launch agent kept running but every collection failed with HTTP 401.

## Decision

Use the OpenCode multi-account store as the collector's only credential source. Remove the configured Codex auth-file list.

The collector will:

1. Load every enabled account from the version 3 OpenCode store.
2. Reject an empty, malformed, or partially usable account set.
3. If any access token is expired or near expiry, run the plugin's documented `warm` command to refresh credentials.
4. Reload the store after the refresh attempt.
5. Require every enabled account to have a current access token and account ID.
6. Fetch each profile and publish only when every fetch succeeds.

A nonzero `warm` exit does not by itself stop collection because the command may refresh credentials before a later quota request fails. The reloaded credential state and profile responses decide success. An expired token after refresh is a hard failure.

## Configuration

Replace `profiles` in `scripts/codex-sync.config.json` with:

```json
{
  "endpoint": "https://www.krishnakumar.dev/api/internal/codex-sync",
  "accountStore": "$HOME/.opencode/oc-codex-multi-auth-accounts.json"
}
```

Pin `oc-codex-multi-auth` as a project dependency so the launch agent does not depend on OpenCode's cache layout or network access.

## Concurrency and credential safety

The collector never writes the OpenCode account store. The plugin command owns token rotation, locking, and persistence. After that process exits, the collector reloads the file. This avoids copying rotating refresh tokens or implementing a second OAuth client.

## Failure behavior

The existing all-or-nothing rule stays in place. Missing store, unsupported store version, disabled or malformed account records, unsuccessful refresh, profile HTTP errors, and invalid profile payloads fail the run without publishing partial data. The existing failure counter and macOS notification remain unchanged.

Logs must identify the failing account by array index only. They must not print email addresses, account IDs, access tokens, or refresh tokens.

## Verification

Unit tests cover valid account loading, malformed stores, expired credentials followed by a successful refresh, refresh that leaves credentials expired, and exclusion of disabled accounts. A manual dry run must collect all three profiles from the OpenCode store. A live run must publish a newer `collectedAt` value, and `launchctl` must report exit code 0 after an immediate kickstart.
