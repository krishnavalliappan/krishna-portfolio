import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ArrowLeft, Check, Copy, Download } from "lucide-react"

import { resume } from "@/features/resume/resume-data"
import { formatResumeText } from "@/features/resume/resume-format"

export const Route = createFileRoute("/resume")({
  server: {
    handlers: {
      GET: ({ request, next }) =>
        request.headers.get("accept")?.includes("text/html")
          ? next()
          : new Response(formatResumeText(resume), {
              headers: {
                "content-type": "text/plain; charset=utf-8",
                vary: "accept",
              },
            }),
    },
  },
  head: () => ({
    meta: [
      { title: `Resume - ${resume.profile.name}` },
      { name: "description", content: resume.profile.summary },
    ],
  }),
  component: ResumePage,
})

function ResumePage() {
  return (
    <main className="resume-page mx-auto max-w-5xl bg-background px-5 py-10 sm:px-10 lg:px-16 lg:py-16">
      <nav className="no-print mb-12 flex flex-wrap items-center justify-between gap-4 border-b pb-5 font-mono text-xs">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> cd /home
        </a>
        <div className="flex flex-wrap items-center gap-2">
          <CurlCommand />
          <a href="/resume.txt" className="border px-3 py-2 hover:bg-secondary">
            TXT
          </a>
          <a
            href="/resume.json"
            className="border px-3 py-2 hover:bg-secondary"
          >
            JSON
          </a>
          <a
            href="/resume.pdf"
            download="krishnakumar_resume.pdf"
            className="inline-flex items-center gap-2 border px-3 py-2 hover:bg-secondary"
          >
            <Download className="size-3" /> PDF
          </a>
        </div>
      </nav>

      <article>
        <header className="border-b-2 border-foreground pb-7">
          <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            {resume.profile.name}
          </h1>
          <p className="mt-3 font-mono text-base text-primary">
            {resume.profile.role}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
            <span>{resume.profile.location}</span>
            <a
              href={`tel:${resume.profile.phone}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {resume.profile.phone}
            </a>
            <a
              href={`mailto:${resume.profile.email}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {resume.profile.email}
            </a>
            <a
              href={resume.profile.github}
              className="underline underline-offset-4 hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href={resume.profile.linkedin}
              className="underline underline-offset-4 hover:text-foreground"
            >
              LinkedIn
            </a>
          </div>
        </header>

        <ResumeSection title="Profile">
          <p className="max-w-4xl leading-7 text-muted-foreground">
            {resume.profile.summary}
          </p>
        </ResumeSection>

        <ResumeSection title="Experience">
          <div className="space-y-10">
            {resume.experience.map((job) => (
              <section key={job.id}>
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                  <div>
                    <h3 className="text-lg font-semibold">{job.role}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company} / {job.location}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {job.period}
                  </p>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                  {job.highlights.map((highlight) => (
                    <li
                      className="relative pl-5 before:absolute before:top-2.5 before:left-0 before:size-1 before:bg-primary"
                      key={highlight}
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </ResumeSection>

        <ResumeSection title="Projects">
          <div className="space-y-8">
            {resume.projects.map((project) => (
              <section key={project.slug}>
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="mt-1 font-mono text-xs text-primary">
                  {project.context}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {project.description}
                </p>
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  {project.stack.join(" / ")}
                </p>
              </section>
            ))}
          </div>
        </ResumeSection>

        <ResumeSection title="Skills">
          <div className="space-y-3 text-sm text-muted-foreground">
            {resume.skills.map((group) => (
              <p key={group.label}>
                <strong className="text-foreground">{group.label}:</strong>{" "}
                {group.skills.join(", ")}
              </p>
            ))}
          </div>
        </ResumeSection>

        <ResumeSection title="Education">
          <div className="space-y-6">
            {resume.education.map((item) => (
              <div key={item.institution}>
                <h3 className="font-semibold">{item.degree}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.institution}, {item.location}
                </p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  {item.period}
                </p>
              </div>
            ))}
          </div>
        </ResumeSection>
      </article>
    </main>
  )
}

function CurlCommand() {
  const [copied, setCopied] = useState(false)
  const command = "curl -L krishnakumar.dev/resume"

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(command)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="inline-flex items-center gap-2 border border-dashed px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
      title="Copy to clipboard"
    >
      <span aria-hidden className="text-primary">
        $
      </span>
      {command}
      {copied ? (
        <Check className="size-3 text-primary" />
      ) : (
        <Copy className="size-3" />
      )}
    </button>
  )
}

function ResumeSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-6 border-t py-9 lg:grid-cols-[10rem_1fr]">
      <h2 className="font-mono text-xs font-semibold tracking-[0.18em] uppercase">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  )
}
