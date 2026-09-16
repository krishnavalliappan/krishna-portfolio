import { describe, expect, it, vi } from "vitest"

import {
  commandFailure,
  fetchActiveOpenCodeProfile,
  parseOpenCodeActivityOutput,
} from "./opencode-profile"

const profile = {
  stats: {
    lifetime_tokens: 123,
    daily_usage_buckets: [{ start_date: "2026-09-16", tokens: 12 }],
  },
}

describe("parseOpenCodeActivityOutput", () => {
  it("reads the profile from the OpenCode RPC envelope", () => {
    expect(
      parseOpenCodeActivityOutput(JSON.stringify({ output: profile }))
    ).toEqual(profile)
  })

  it("rejects invalid JSON and malformed profiles", () => {
    expect(() => parseOpenCodeActivityOutput("not json")).toThrow(
      "OpenCode returned invalid JSON"
    )
    expect(() =>
      parseOpenCodeActivityOutput(JSON.stringify({ output: { stats: {} } }))
    ).not.toThrow()
    expect(() =>
      parseOpenCodeActivityOutput(JSON.stringify({ output: { nope: true } }))
    ).toThrow("OpenCode returned malformed activity")
  })
})

describe("fetchActiveOpenCodeProfile", () => {
  it("calls the local activity RPC through the OpenCode CLI", async () => {
    const run = vi.fn(async () => ({
      stdout: JSON.stringify({ output: profile }),
    }))

    await expect(fetchActiveOpenCodeProfile("/opencode", run)).resolves.toEqual(
      profile
    )
    expect(run).toHaveBeenCalledWith("/opencode", [
      "api",
      "post",
      "/api/rpc/local.openai-usage/activity",
      "--data",
      '{"input":{}}',
    ])
  })

  it("surfaces RPC errors without exposing credentials", async () => {
    const error = Object.assign(new Error("command failed"), {
      code: 1,
      stdout: JSON.stringify({
        type: "rpc.unavailable",
        message: "Active OpenAI credential is unavailable",
        access: "secret-from-stdout",
      }),
      stderr:
        'request failed Bearer secret-token refreshToken="secret-refresh"',
    })
    const run = vi.fn(async () => {
      throw error
    })

    await expect(fetchActiveOpenCodeProfile("opencode", run)).rejects.toThrow(
      "rpc.unavailable: Active OpenAI credential is unavailable"
    )
    expect(commandFailure(error)).not.toContain("secret-token")
    expect(commandFailure(error)).not.toContain("secret-refresh")
    expect(commandFailure(error)).not.toContain("secret-from-stdout")
  })
})
