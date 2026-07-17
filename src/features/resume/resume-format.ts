import type { Resume } from "./resume-data"

export function formatResumeText(resume: Resume) {
  const { profile } = resume
  const lines = [
    profile.name.toUpperCase(),
    profile.role,
    [profile.location, profile.phone, profile.email, profile.website].join(
      " | "
    ),
    "",
    "SUMMARY",
    profile.summary,
    "",
    "EXPERIENCE",
  ]

  for (const job of resume.experience) {
    lines.push(
      "",
      `${job.role} | ${job.company} | ${job.location}`,
      job.period,
      ...job.highlights.map((highlight) => `- ${highlight}`)
    )
  }

  lines.push("", "PROJECTS")
  for (const project of resume.projects) {
    lines.push(
      "",
      `${project.title} | ${project.context}`,
      project.description,
      `Stack: ${project.stack.join(", ")}`,
      ...("url" in project ? [project.url] : [])
    )
  }

  lines.push("", "EDUCATION")
  for (const item of resume.education) {
    lines.push(
      `${item.degree} | ${item.institution} | ${item.period} | ${item.location}`
    )
  }

  lines.push("", "SKILLS")
  for (const group of resume.skills) {
    lines.push(`${group.label}: ${group.skills.join(", ")}`)
  }

  return `${lines.join("\n")}\n`
}
