import { describe, expect, it } from "vitest"

import {
  buildThresholds,
  buildWeeks,
  buildWindow,
  lastActiveIndex,
  levelOf,
  monthLabels,
  summarize,
  todayIso,
} from "./calendar"

const day = (date: string, tokens = 0) => ({
  date,
  tokens,
  contributions: null,
})

describe("buildWeeks", () => {
  it("pads the first column so row 0 is always Sunday", () => {
    // 2026-01-01 is a Thursday, so three leading slots stay empty.
    const weeks = buildWeeks([day("2026-01-01"), day("2026-01-02")])

    expect(weeks[0].slice(0, 4)).toEqual([null, null, null, null])
    expect(weeks[0][4]).toMatchObject({ index: 0, day: { date: "2026-01-01" } })
  })

  it("pads the final week to seven rows", () => {
    const weeks = buildWeeks([day("2026-01-04")])
    expect(weeks).toHaveLength(1)
    expect(weeks[0]).toHaveLength(7)
  })

  it("returns nothing for an empty range", () => {
    expect(buildWeeks([])).toEqual([])
  })
})

describe("monthLabels", () => {
  it("labels each month once and skips colliding labels", () => {
    const days = Array.from({ length: 120 }, (_, index) =>
      day(new Date(Date.UTC(2026, 0, 1 + index)).toISOString().slice(0, 10))
    )
    const labels = monthLabels(buildWeeks(days))

    expect(labels.map((entry) => entry.label)).toEqual([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
    ])
    labels.slice(1).forEach((entry, index) => {
      expect(entry.index - labels[index].index).toBeGreaterThanOrEqual(3)
    })
  })
})

describe("buildThresholds", () => {
  it("ignores zero days when cutting quartiles", () => {
    expect(buildThresholds([0, 0, 0, 0, 1, 2, 3, 4])).toEqual([2, 3, 4])
  })

  it("collapses to zero when nothing is active", () => {
    expect(buildThresholds([0, 0])).toEqual([0, 0, 0])
  })
})

describe("levelOf", () => {
  it("keeps an outlier day from flattening the rest", () => {
    const values = [...Array.from({ length: 20 }, () => 100), 40_000_000]
    const thresholds = buildThresholds(values)

    expect(levelOf(0, thresholds)).toBe(0)
    expect(levelOf(100, thresholds)).toBe(1)
    expect(levelOf(40_000_000, thresholds)).toBe(4)
  })
})

describe("lastActiveIndex", () => {
  it("skips the trailing days the collector has not filled yet", () => {
    const window = buildWindow(
      [{ date: "2026-01-01", tokens: 5 }],
      null,
      "2026-01-03",
      3
    )

    expect(lastActiveIndex(window, "tokens")).toBe(0)
  })

  it("tracks the metric on screen", () => {
    const window = buildWindow(
      [{ date: "2026-01-01", tokens: 5 }],
      [{ date: "2026-01-03", contributions: 2 }],
      "2026-01-03",
      3
    )

    expect(lastActiveIndex(window, "tokens")).toBe(0)
    expect(lastActiveIndex(window, "contributions")).toBe(2)
  })

  it("falls back to the last day when nothing is active", () => {
    const window = buildWindow([], null, "2026-01-03", 3)
    expect(lastActiveIndex(window, "tokens")).toBe(2)
  })

  it("returns zero for an empty window", () => {
    expect(lastActiveIndex([], "tokens")).toBe(0)
  })
})

describe("todayIso", () => {
  it("reads the local calendar date rather than the UTC one", () => {
    // Just after UTC midnight: still the previous day anywhere west of it.
    // en-CA renders YYYY-MM-DD in local time, so it is an oracle that holds
    // whichever timezone the test runner sits in.
    const now = new Date("2026-01-02T00:30:00Z")
    expect(todayIso(now)).toBe(now.toLocaleDateString("en-CA"))
  })

  it("pads single-digit months and days", () => {
    // Local-constructed, so the expectation is timezone independent.
    expect(todayIso(new Date(2026, 2, 5))).toBe("2026-03-05")
  })
})

describe("buildWindow", () => {
  it("keeps trailing days that have no data yet", () => {
    const window = buildWindow(
      [{ date: "2026-01-01", tokens: 5 }],
      null,
      // Collector last ran on the 1st; the grid still runs to the 3rd.
      "2026-01-03",
      3
    )

    expect(window.at(-1)).toEqual({
      date: "2026-01-03",
      tokens: 0,
      contributions: null,
    })
  })

  it("emits a contiguous window even when a source skips days", () => {
    const window = buildWindow(
      [
        { date: "2026-01-01", tokens: 5 },
        // 2026-01-02 never reported — the collector omits idle days.
        { date: "2026-01-03", tokens: 7 },
      ],
      null,
      "2026-01-03",
      3
    )

    expect(window).toEqual([
      { date: "2026-01-01", tokens: 5, contributions: null },
      { date: "2026-01-02", tokens: 0, contributions: null },
      { date: "2026-01-03", tokens: 7, contributions: null },
    ])
  })

  it("marks contributions null when GitHub is unavailable", () => {
    const window = buildWindow(
      [{ date: "2026-01-01", tokens: 5 }],
      null,
      "2026-01-01",
      1
    )
    expect(window[0].contributions).toBeNull()
  })

  it("fills missing GitHub dates with zero rather than null", () => {
    const window = buildWindow(
      [{ date: "2026-01-02", tokens: 5 }],
      [{ date: "2026-01-01", contributions: 3 }],
      "2026-01-02",
      2
    )

    expect(window).toEqual([
      { date: "2026-01-01", tokens: 0, contributions: 3 },
      { date: "2026-01-02", tokens: 5, contributions: 0 },
    ])
  })

  it("drops days older than the window", () => {
    const window = buildWindow(
      [
        { date: "2020-01-01", tokens: 999 },
        { date: "2026-01-02", tokens: 5 },
      ],
      null,
      "2026-01-02",
      2
    )

    expect(window.map((entry) => entry.date)).toEqual([
      "2026-01-01",
      "2026-01-02",
    ])
  })
})

describe("summarize", () => {
  it("counts the longest run of active days", () => {
    const window = buildWindow(
      [
        { date: "2026-01-01", tokens: 5 },
        { date: "2026-01-02", tokens: 5 },
        { date: "2026-01-04", tokens: 5 },
      ],
      null,
      "2026-01-04",
      4
    )

    expect(summarize(window, "tokens")).toEqual({
      total: 15,
      activeDays: 3,
      longestStreak: 2,
    })
  })
})
