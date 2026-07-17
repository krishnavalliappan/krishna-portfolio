import { education, experience } from "@/content/site"

/**
 * The work history rendered as a `git log --graph`: roles are commits on main,
 * education is a merge from a side branch. Derived from the resume data in
 * `@/content/site` so the resume exports stay the single source of truth.
 */
export type CareerCommit = {
  id: string
  sha: string
  /** Ref decoration shown before the subject, e.g. `HEAD -> main`. */
  badge: string | null
  subject: string
  scope: string
  meta: string
  body: readonly string[]
  /**
   * `commit` sits on the main trunk; `branch` sits on a side track that forks
   * from the commit below it and merges into the one above; `init` is the root.
   */
  kind: "commit" | "branch" | "init"
}

const SHA_ALPHABET = "0123456789abcdef"

/** Deterministic 7-char hex label. Cosmetic only — not a real object hash. */
export function shortSha(seed: string): string {
  let hash = 0x811c9dc5
  for (const char of seed) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }

  let sha = ""
  for (let index = 0; index < 7; index += 1) {
    sha += SHA_ALPHABET[hash & 0xf]
    hash >>>= 4
    if (hash === 0) hash = Math.imul(seed.length + index + 1, 0x01000193) >>> 0
  }
  return sha
}

function branchName(period: string): string {
  const start = period.match(/\d{4}/)?.[0] ?? "main"
  return start
}

const roleCommits: CareerCommit[] = experience.map((job, index) => ({
  id: job.id,
  sha: shortSha(job.id),
  badge: index === 0 ? "HEAD -> main" : null,
  subject: job.role,
  scope: job.company,
  meta: `${job.location} · ${job.period}`,
  body: job.highlights,
  kind: "commit",
}))

const educationCommits: CareerCommit[] = education.map((school) => ({
  id: `edu-${branchName(school.period)}`,
  sha: shortSha(school.institution),
  badge: `edu/${school.institution.split(" ")[0].toLowerCase()}`,
  subject: school.degree,
  scope: school.institution,
  meta: `${school.location} · ${school.period}`,
  body: [
    "Graduate engineering studies after moving from India to Canada.",
    "Built JobScout on the side — an open-source job-hunt tool now at 45+ stars.",
  ],
  kind: "branch",
}))

const rootCommit: CareerCommit = {
  id: "init",
  sha: shortSha("init"),
  badge: "init",
  subject: "first commit",
  scope: "learning by shipping",
  meta: "2020",
  body: [
    "Built things nobody asked for: scrapers, dashboards, scripts to kill my own busywork.",
    "Learned by finishing them, not by reading about them.",
  ],
  kind: "init",
}

/** Newest first, the way `git log` prints it. */
export const careerLog: readonly CareerCommit[] = [
  roleCommits[0],
  ...educationCommits,
  ...roleCommits.slice(1),
  rootCommit,
]
