import { describe, expect, it } from "vitest"

import { getViewerOffsetDelta } from "./timezone"

const JANUARY = new Date("2025-01-15T12:00:00Z")
const JULY = new Date("2025-07-15T12:00:00Z")

describe("getViewerOffsetDelta", () => {
  it("formats whole-hour deltas in both directions", () => {
    expect(getViewerOffsetDelta("Europe/London", undefined, JANUARY)).toBe(
      "5h behind you"
    )
    expect(
      getViewerOffsetDelta("America/Los_Angeles", undefined, JANUARY)
    ).toBe("3h ahead of you")
  })

  it("formats a half-hour delta", () => {
    expect(getViewerOffsetDelta("Asia/Kolkata", undefined, JANUARY)).toBe(
      "10h 30m behind you"
    )
  })

  it("formats a 45-minute delta", () => {
    expect(getViewerOffsetDelta("Asia/Kathmandu", undefined, JANUARY)).toBe(
      "10h 45m behind you"
    )
  })

  it("returns null for the same offset", () => {
    expect(
      getViewerOffsetDelta("America/Toronto", undefined, JANUARY)
    ).toBeNull()
  })

  it("accounts for DST at the same viewer time zone", () => {
    expect(getViewerOffsetDelta("America/Phoenix", undefined, JANUARY)).toBe(
      "2h ahead of you"
    )
    expect(getViewerOffsetDelta("America/Phoenix", undefined, JULY)).toBe(
      "3h ahead of you"
    )
  })
})
