import {
  education,
  experience,
  projects,
  site,
  skillGroups,
} from "@/content/site"

export const resume = {
  version: "1.0",
  profile: {
    name: site.name,
    role: "Software Engineer",
    location: site.location,
    phone: site.phone,
    email: site.email,
    website: site.website,
    github: site.github,
    linkedin: site.linkedin,
    summary:
      "Software Engineer with 3+ years building end-to-end products across responsive web interfaces, APIs, AI workflows, and data systems using TypeScript, Vue, React, Python, FastAPI, Express, and SQL.",
  },
  experience,
  projects: projects.filter((project) => project.context === "Open source"),
  education,
  skills: skillGroups,
} as const

export type Resume = typeof resume
