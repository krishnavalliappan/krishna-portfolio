import { describe, expect, it } from "vitest"

import {
  isFreshTimestamp,
  signActivity,
  verifyActivitySignature,
} from "./signature"

describe("activity signatures", () => {
  it("rejects changed bodies and stale timestamps", () => {
    const timestamp = "2026-07-15T12:00:00.000Z"
    const signature = signActivity(timestamp, "body", "secret")

    expect(
      verifyActivitySignature(timestamp, "body", signature, "secret")
    ).toBe(true)
    expect(
      verifyActivitySignature(timestamp, "changed", signature, "secret")
    ).toBe(false)
    expect(isFreshTimestamp(timestamp, Date.parse(timestamp) + 299_000)).toBe(
      true
    )
    expect(isFreshTimestamp(timestamp, Date.parse(timestamp) + 301_000)).toBe(
      false
    )
  })
})
