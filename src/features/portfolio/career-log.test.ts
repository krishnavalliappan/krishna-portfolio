import { describe, expect, it } from "vitest"

import { experience } from "@/content/site"

import { careerLog, shortSha } from "./career-log"

describe("career log", () => {
  it("reads newest first, merges education, and roots at init", () => {
    expect(careerLog[0].badge).toBe("HEAD -> main")
    expect(careerLog[0].subject).toBe(experience[0].role)
    expect(careerLog.map((commit) => commit.kind)).toEqual([
      "commit",
      "branch",
      "commit",
      "init",
    ])
    expect(new Set(careerLog.map((commit) => commit.sha)).size).toBe(
      careerLog.length
    )
  })

  it("derives a stable 7-char sha per seed", () => {
    expect(shortSha("ipac")).toBe(shortSha("ipac"))
    expect(shortSha("ipac")).toMatch(/^[0-9a-f]{7}$/)
    expect(shortSha("ipac")).not.toBe(shortSha("ia-flow"))
  })
})
