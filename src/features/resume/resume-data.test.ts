import { describe, expect, it } from "vitest"

import { resume } from "./resume-data"

describe("resume data", () => {
  it("contains the required public resume sections", () => {
    expect(resume.profile.email).toMatch(/@/)
    expect(resume.experience.length).toBeGreaterThan(0)
    expect(resume.projects.length).toBeGreaterThan(0)
    expect(resume.education.length).toBeGreaterThan(0)
    expect(resume.skills.length).toBeGreaterThan(0)
  })
})
