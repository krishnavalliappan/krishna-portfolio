import { describe, expect, it } from "vitest"

import { formatResumeText } from "./resume-format"
import { resume } from "./resume-data"

describe("formatResumeText", () => {
  it("serializes every resume section", () => {
    const text = formatResumeText(resume)

    for (const heading of [
      "SUMMARY",
      "EXPERIENCE",
      "PROJECTS",
      "EDUCATION",
      "SKILLS",
    ]) {
      expect(text).toContain(heading)
    }
    expect(text).toContain(resume.profile.email)
    expect(text).toContain(resume.experience[0].company)
  })
})
