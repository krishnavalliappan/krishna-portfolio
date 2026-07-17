import { describe, expect, it } from "vitest"

import { mapContributionsResponse } from "./github.server"

const collectedAt = "2026-07-16T00:00:00.000Z"

describe("mapContributionsResponse", () => {
  it("flattens the week nesting into daily counts", () => {
    const result = mapContributionsResponse(
      {
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: {
                totalContributions: 5,
                weeks: [
                  {
                    contributionDays: [
                      { date: "2026-07-12", contributionCount: 2 },
                      { date: "2026-07-13", contributionCount: 0 },
                    ],
                  },
                  {
                    contributionDays: [
                      { date: "2026-07-14", contributionCount: 3 },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      collectedAt,
      "krishnavalliappan"
    )

    expect(result).toEqual({
      status: "ok",
      login: "krishnavalliappan",
      collectedAt,
      totalContributions: 5,
      daily: [
        { date: "2026-07-12", contributions: 2 },
        { date: "2026-07-13", contributions: 0 },
        { date: "2026-07-14", contributions: 3 },
      ],
    })
  })

  it("reports unavailable for an unknown login", () => {
    const result = mapContributionsResponse(
      { data: { user: null } },
      collectedAt,
      "ghost"
    )
    expect(result).toEqual({ status: "unavailable" })
  })

  it("reports unavailable when GitHub returns errors instead of data", () => {
    const result = mapContributionsResponse(
      { errors: [{ message: "Bad credentials" }] },
      collectedAt,
      "krishnavalliappan"
    )
    expect(result).toEqual({ status: "unavailable" })
  })
})
