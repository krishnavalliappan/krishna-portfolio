import { allCaseStudies, allWritings } from "content-collections"
import { describe, expect, it } from "vitest"

import { projects, site } from "./site"

describe("public content", () => {
  it("has unique routes and no known placeholder links", () => {
    for (const slugs of [
      projects.map((project) => project.slug),
      allCaseStudies.map((entry) => entry.slug),
      allWritings.map((entry) => entry.slug),
    ])
      expect(new Set(slugs).size).toBe(slugs.length)
    expect(JSON.stringify({ projects, site })).not.toMatch(/"(?:#|\.\.\.)"/)
  })
})
