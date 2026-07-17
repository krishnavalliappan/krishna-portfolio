"use client"

import { allCaseStudies, allWritings } from "content-collections"
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  Circle,
  Copy,
  FileText,
  Mail,
  Terminal,
} from "lucide-react"
import { useEffect, useState } from "react"

import { SectionHeading } from "@/components/site/section-heading"
import { SiteHeader } from "@/components/site/site-header"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  experience,
  profile,
  projects,
  site,
  skillGroups,
} from "@/content/site"
import { CodexActivity } from "@/features/codex-activity/codex-activity"
import type { CareerCommit } from "@/features/portfolio/career-log"
import { careerLog } from "@/features/portfolio/career-log"
import { skillIcons } from "@/features/portfolio/skill-icons"
import { SpotifyCard } from "@/features/spotify/spotify-card"
import { getUtcOffsetLabel, getViewerOffsetDelta } from "@/lib/timezone"

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.76.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.21.69.83.57A12 12 0 0 0 12 .3Z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.04c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM6.81 20.45H3.86V9h2.95v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.23 0Z" />
    </svg>
  )
}

export function Portfolio() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell scroll-mt-14">
        <Hero />
        <Experience />
        <Activity />
        <Projects />
        <Writing />
        <Skills />
      </main>
      <Footer />
    </>
  )
}

function Hero() {
  const resumeCommand = "curl -L krishnakumar.dev/resume"
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  )
  const [delta, setDelta] = useState<string | null>(null)
  const utcLabel = getUtcOffsetLabel().toLowerCase()

  useEffect(() => {
    const viewerTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setDelta(getViewerOffsetDelta(viewerTimeZone))
  }, [])

  async function copyResumeCommand() {
    try {
      await navigator.clipboard.writeText(resumeCommand)
      setCopyStatus("copied")
    } catch {
      setCopyStatus("failed")
    }
    window.setTimeout(() => setCopyStatus("idle"), 2_000)
  }

  return (
    <section
      data-xray="SSR · typed static content · no tracking"
      className="relative overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b px-5 py-2.5 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase sm:px-8 lg:px-14">
        <span>
          loc {site.coordinates} · {site.airport}
        </span>
        <span>
          {utcLabel}
          {delta ? ` · ${delta}` : ""}
        </span>
        <span className="ml-auto inline-flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          <span className="text-primary">
            {site.availability.code} OK · {site.availability.label}
          </span>
        </span>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(300px,0.75fr)]">
        <div className="min-w-0 px-5 py-14 sm:px-8 lg:px-14 lg:py-20">
          <h1 className="hero-fade-in max-w-5xl text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.82] font-semibold tracking-[-0.075em]">
            Krishnakumar
            <br />
            <span className="text-muted-foreground">Valliappan.</span>
          </h1>
          <p className="mt-10 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Software engineer turning complicated workflows into dependable
            products, from AI-assisted tools and streaming APIs to data-rich
            interfaces.
          </p>
          <p className="mt-10 font-mono text-xs text-muted-foreground">
            Get my resume in your terminal, or ask your agent to fetch it.
          </p>
          <button
            type="button"
            onClick={copyResumeCommand}
            className="mt-3 flex w-full max-w-xl cursor-copy items-center gap-2 overflow-hidden border bg-card px-3 py-3 text-left font-mono text-[11px] transition-colors hover:bg-secondary sm:px-4 sm:text-xs"
          >
            <span className="text-muted-foreground">$</span>
            <code className="min-w-0 flex-1 truncate text-primary">
              {resumeCommand}
            </code>
            <span className="h-4 w-1.5 shrink-0 animate-pulse bg-primary" />
            <span
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 border-l pl-3 text-muted-foreground"
              aria-live="polite"
            >
              {copyStatus === "copied" ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
              {copyStatus === "copied"
                ? "Copied"
                : copyStatus === "failed"
                  ? "Try again"
                  : "Copy"}
            </span>
          </button>
          <div className="mt-8 flex flex-col gap-5">
            <a
              href="#work"
              className="group inline-flex w-fit items-center gap-2.5 bg-primary px-6 py-3.5 font-mono text-sm font-semibold tracking-[0.08em] text-primary-foreground uppercase transition-colors hover:bg-primary/80"
            >
              Inspect work
              <ArrowDown
                className="size-4 transition-transform group-hover:translate-y-0.5"
                aria-hidden="true"
              />
            </a>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <GitHubIcon className="size-4 fill-current" />
                GitHub ↗
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <LinkedInIcon className="size-4 fill-current" />
                LinkedIn ↗
              </a>
              <a
                href="/resume"
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <FileText className="size-4" aria-hidden="true" />
                Resume ↓
              </a>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail className="size-4" aria-hidden="true" />
                Email →
              </a>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col border-t lg:border-t-0 lg:border-l">
          <aside className="border-b p-5 font-mono text-xs leading-6 sm:p-8 lg:p-8">
            <p className="mb-4 text-xs tracking-[0.12em] text-muted-foreground">
              /profile.json
            </p>
            <dl className="grid grid-cols-[5rem_1fr] gap-y-2">
              <dt className="text-muted-foreground">role</dt>
              <dd>{profile.role}</dd>
              <dt className="text-muted-foreground">now</dt>
              <dd>{experience[0].company}</dd>
              <dt className="text-muted-foreground">base</dt>
              <dd>{site.location}</dd>
              <dt className="text-muted-foreground">focus</dt>
              <dd>{profile.focus}</dd>
              <dt className="text-muted-foreground">exp</dt>
              <dd>{profile.experienceLabel}</dd>
            </dl>
          </aside>
          <div className="min-h-32 p-5 sm:p-8 lg:p-8">
            <p className="mb-4 font-mono text-xs tracking-[0.12em] text-muted-foreground">
              /spotify/now-playing
            </p>
            <SpotifyCard />
          </div>
        </div>
      </div>
    </section>
  )
}

function Experience() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section
      id="work"
      data-xray="SSR · resume data model · static"
      className="section-rule scroll-mt-14"
    >
      <SectionHeading
        index="01"
        label="Work history"
        title="Production systems, not tutorial projects."
      />
      <div>
        <p className="mb-6 font-mono text-sm text-muted-foreground">
          <span className="text-primary">$</span> git log --graph --career{" "}
          <span className="text-muted-foreground/60">
            # click a commit to expand
          </span>
        </p>
        <div className="border-t">
          {careerLog.map((commit, index) => (
            <CareerCommitRow
              key={commit.id}
              commit={commit}
              branchAbove={careerLog[index - 1]?.kind === "branch"}
              branchBelow={careerLog[index + 1]?.kind === "branch"}
              open={openId === commit.id}
              onOpenChange={(next) => setOpenId(next ? commit.id : null)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function CareerCommitRow({
  commit,
  branchAbove,
  branchBelow,
  open,
  onOpenChange,
}: {
  commit: CareerCommit
  branchAbove: boolean
  branchBelow: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isRoot = commit.kind === "init"

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="border-b">
      <div className="grid grid-cols-[3rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_minmax(0,1fr)]">
        <CommitRail
          commit={commit}
          branchAbove={branchAbove}
          branchBelow={branchBelow}
          open={open}
        />
        {/* branch commits sit off the trunk, so their content indents to match */}
        <div className={`min-w-0 ${commit.kind === "branch" ? "pl-6" : ""}`}>
          <CollapsibleTrigger className="group flex w-full cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1 py-5 text-left">
            {commit.badge ? (
              <span
                className={`font-mono text-xs tracking-tight ${
                  isRoot ? "text-muted-foreground/60" : "text-primary"
                }`}
              >
                ({commit.badge})
              </span>
            ) : null}
            <span
              className={`text-lg font-medium transition-colors group-hover:text-primary sm:text-xl ${
                isRoot ? "text-muted-foreground" : ""
              }`}
            >
              {commit.subject}
            </span>
            <span className="text-sm text-muted-foreground">
              · {commit.scope}
            </span>
            <span className="mt-1 flex w-full items-center gap-3 font-mono text-xs text-muted-foreground sm:mt-0 sm:ml-auto sm:w-auto">
              <span className="hidden sm:inline">{commit.sha}</span>
              <span>{commit.meta}</span>
              <ChevronDown
                className={`ml-auto size-3.5 transition-transform sm:ml-0 ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-[collapsible-up_180ms_ease-out] data-[state=open]:animate-[collapsible-down_180ms_ease-out]">
            <ul className="space-y-3 pb-7 font-mono text-sm leading-[1.7] text-muted-foreground">
              {commit.body.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span aria-hidden="true" className="text-primary">
                    +
                  </span>
                  <span className="min-w-0">{line}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  )
}

/**
 * The `git log --graph` gutter. Main runs down the trunk; a branch commit sits
 * on its own track 22px to the right, forking out of the commit below it and
 * merging into the one above — the `|\ ... |/` shape git prints.
 */
function CommitRail({
  commit,
  branchAbove,
  branchBelow,
  open,
}: {
  commit: CareerCommit
  branchAbove: boolean
  branchBelow: boolean
  open: boolean
}) {
  const isRoot = commit.kind === "init"
  const isBranch = commit.kind === "branch"
  const nodeStyle = isRoot
    ? "border-muted-foreground/40 bg-muted-foreground/40"
    : open || isBranch || commit.badge
      ? "border-primary bg-primary"
      : "border-border bg-background"

  return (
    <div aria-hidden="true" className="relative text-border">
      {/* trunk, stopping at the root commit */}
      <span
        className={`absolute top-0 left-[7px] w-px bg-border sm:left-[11px] ${
          isRoot ? "h-[30px]" : "bottom-0"
        }`}
      />
      {/* branch track running the full height of a branch commit's row */}
      {isBranch ? (
        <span className="absolute inset-y-0 left-[29px] w-px bg-border sm:left-[33px]" />
      ) : null}
      {/* fork out: trunk node down to the branch track */}
      {branchBelow ? (
        <>
          <Diagonal className="absolute top-[30px] left-[7px] sm:left-[11px]" />
          <span className="absolute top-[52px] bottom-0 left-[29px] w-px bg-border sm:left-[33px]" />
        </>
      ) : null}
      {/* merge back: branch track down into the trunk node */}
      {branchAbove ? (
        <>
          <span className="absolute top-0 left-[29px] h-[8px] w-px bg-border sm:left-[33px]" />
          <Diagonal
            className="absolute top-[8px] left-[7px] sm:left-[11px]"
            flipped
          />
        </>
      ) : null}
      <span
        className={`absolute top-[26px] size-[9px] rounded-full border-2 transition-colors ${
          isBranch ? "left-[25px] sm:left-[29px]" : "left-[3px] sm:left-[7px]"
        } ${nodeStyle}`}
      />
    </div>
  )
}

/** 22×22 branch segment: node corner to branch track, at a 45° incline. */
function Diagonal({
  className,
  flipped = false,
}: {
  className?: string
  flipped?: boolean
}) {
  return (
    <svg
      className={`size-[22px] ${className ?? ""}`}
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
    >
      <path d={flipped ? "M22 0 L0 22" : "M0 0 L22 22"} />
    </svg>
  )
}

function Projects() {
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  return (
    <section
      id="projects"
      data-xray="SSR · typed project data + MDX"
      className="section-rule scroll-mt-14"
    >
      <SectionHeading
        index="03"
        label="Projects"
        title="Shipped at work and after hours."
      />
      <div className="border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3 font-mono text-xs sm:px-6">
          <span className="text-primary">$</span>
          <span>ls ~/projects</span>
          <span className="ml-auto text-muted-foreground">
            total {projects.length}
          </span>
        </div>
        {projects.map((project, index) => (
          <ProjectEntry
            key={project.slug}
            project={project}
            index={index}
            open={openSlug === project.slug}
            onOpenChange={(next) => setOpenSlug(next ? project.slug : null)}
          />
        ))}
        <div
          aria-hidden="true"
          className="flex items-center gap-2 px-4 py-3 font-mono text-xs sm:px-6"
        >
          <span className="text-primary">$</span>
          <span className="h-4 w-1.5 animate-pulse bg-primary" />
        </div>
      </div>
    </section>
  )
}

/**
 * One project as an `ls -la` row that expands into its README. Collapsed shows
 * the listing line, outcome comment, stack tags, and links; open runs
 * `cat <slug>/README.md`. Links sit outside the trigger so they stay reachable
 * without expanding (and buttons can't nest anchors).
 */
function ProjectEntry({
  project,
  index,
  open,
  onOpenChange,
}: {
  project: (typeof projects)[number]
  index: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const url = "url" in project ? project.url : undefined
  const hasCaseStudy = allCaseStudies.some(
    (study) => study.slug === project.slug && !study.draft
  )

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="border-b">
      <div className="grid gap-x-4 px-4 sm:grid-cols-[2rem_1fr] sm:px-6">
        <span className="hidden pt-6 font-mono text-xs text-primary sm:block">
          0{index + 1}
        </span>
        <div className="min-w-0">
          <CollapsibleTrigger className="group flex w-full cursor-pointer flex-col pt-6 text-left">
            <span className="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xl tracking-tight transition-colors group-hover:text-primary sm:text-2xl">
                {project.slug}/
              </span>
              <span className="eyebrow">{project.year}</span>
              <span className="mt-1 flex w-full items-center gap-3 font-mono text-xs text-muted-foreground sm:mt-0 sm:ml-auto sm:w-auto">
                <span className="hidden sm:inline">drwxr-xr-x</span>
                <ChevronDown
                  className={`ml-auto size-3.5 transition-transform sm:ml-0 ${open ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </span>
            </span>
            <span className="mt-3 block font-mono text-xs text-primary">
              # {project.outcome}
            </span>
          </CollapsibleTrigger>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 pb-6">
            <span className="flex flex-wrap gap-1.5">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="border px-2 py-0.5 font-mono text-xs text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </span>
            <span className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs tracking-[0.08em] uppercase sm:ml-auto">
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 border-b border-primary/40 pb-1 text-primary transition-colors hover:border-primary hover:text-foreground"
                >
                  GitHub <ArrowUpRight className="size-3.5" />
                </a>
              ) : null}
              {hasCaseStudy ? (
                <a
                  href={`/case-studies/${project.slug}`}
                  className="inline-flex items-center gap-1.5 border-b border-primary/40 pb-1 text-primary transition-colors hover:border-primary hover:text-foreground"
                >
                  Case study <Terminal className="size-3.5" />
                </a>
              ) : null}
            </span>
          </div>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-[collapsible-up_180ms_ease-out] data-[state=open]:animate-[collapsible-down_180ms_ease-out]">
            <div className="pb-7">
              <p className="font-mono text-xs text-muted-foreground">
                <span className="text-primary">$</span> cat {project.slug}
                /README.md
              </p>
              <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
                {project.description}
              </p>
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  )
}

function Activity() {
  return (
    <section
      id="activity"
      data-xray="CSR · Turso aggregate · cached"
      className="section-rule scroll-mt-14"
    >
      <SectionHeading
        index="02"
        label="Activity"
        title="Every day of the last year, on the record."
      />
      <div className="border bg-card p-6 sm:p-9">
        <CodexActivity />
      </div>
    </section>
  )
}

function Writing() {
  return (
    <section
      id="writing"
      data-xray="SSR · local MDX collection · build-time validation"
      className="section-rule scroll-mt-14"
    >
      <SectionHeading
        index="04"
        label="Writing"
        title="Written after the incident, not before."
      />
      <div className="border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3 font-mono text-xs sm:px-6">
          <span className="text-primary">$</span>
          <span>ls ~/writing</span>
          <span className="ml-auto text-muted-foreground">
            total {allWritings.filter((article) => !article.draft).length}
          </span>
        </div>
        {allWritings
          .filter((article) => !article.draft)
          .map((article, index) => (
            <a
              key={article.slug}
              href={`/writing/${article.slug}`}
              className="group grid gap-4 border-b px-4 py-7 transition-colors hover:bg-secondary/60 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:px-6"
            >
              <span className="font-mono text-xs text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block text-xl font-medium tracking-tight">
                  {article.title}
                </span>
                <span className="mt-2 block max-w-4xl text-sm leading-6 text-muted-foreground">
                  {article.summary}
                </span>
                <span className="mt-4 flex flex-wrap gap-1.5">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border px-2 py-0.5 font-mono text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </span>
              <ArrowUpRight
                className="hidden size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:block"
                aria-hidden="true"
              />
            </a>
          ))}
        <div
          aria-hidden="true"
          className="flex items-center gap-2 px-4 py-3 font-mono text-xs sm:px-6"
        >
          <span className="text-primary">$</span>
          <span className="h-4 w-1.5 animate-pulse bg-primary" />
        </div>
      </div>
    </section>
  )
}

const skillDirNames: Record<string, string> = {
  Languages: "languages",
  Backend: "backend",
  Frontend: "frontend",
  AI: "ai",
  "Data and cloud": "data-cloud",
}

const totalSkills = skillGroups.reduce(
  (sum, group) => sum + group.skills.length,
  0
)

function Skills() {
  return (
    <section data-xray="SSR · typed static skills" className="section-rule">
      <SectionHeading
        index="05"
        label="Toolchain"
        title="Every tool here shipped something. Nothing decorative."
      />
      <div className="border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3 font-mono text-xs sm:px-6">
          <span className="text-primary">$</span>
          <span>tree ~/stack</span>
          <span className="ml-auto text-muted-foreground">
            {skillGroups.length} dirs · {totalSkills} tools
          </span>
        </div>
        <div className="px-4 py-6 font-mono text-sm sm:px-6">
          {skillGroups.map((group, groupIndex) => {
            const isLast = groupIndex === skillGroups.length - 1
            return (
              <div key={group.label} className="grid grid-cols-[1.5rem_1fr]">
                <span
                  aria-hidden="true"
                  className="text-muted-foreground/50 select-none"
                >
                  {isLast ? "└──" : "├──"}
                </span>
                <div className={isLast ? "pb-1" : "pb-5"}>
                  <p className="text-primary">{skillDirNames[group.label]}/</p>
                  <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                    {group.skills.map((skill) => {
                      const Icon = skillIcons[skill]
                      return (
                        <li
                          key={skill}
                          className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {Icon ? (
                            <Icon
                              className="size-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
                              aria-hidden="true"
                            />
                          ) : null}
                          {skill}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )
          })}
          <div
            aria-hidden="true"
            className="mt-4 flex items-center gap-2 text-xs"
          >
            <span className="text-primary">$</span>
            <span className="h-4 w-1.5 animate-pulse bg-primary" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 bg-background px-5 py-8 font-mono text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
      <div className="flex items-center gap-2">
        <Circle className="size-2 fill-primary text-primary" /> built in Toronto
      </div>
      <div className="flex items-center gap-5 sm:gap-6">
        <a
          className="flex items-center gap-2 transition-colors hover:text-foreground"
          href={site.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          title="GitHub"
        >
          <GitHubIcon className="size-4 fill-current" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <a
          className="flex items-center gap-2 transition-colors hover:text-foreground"
          href={site.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          title="LinkedIn"
        >
          <LinkedInIcon className="size-4 fill-current" />
          <span className="hidden sm:inline">LinkedIn</span>
        </a>
        <a
          className="flex items-center gap-2 transition-colors hover:text-foreground"
          href={`mailto:${site.email}`}
          aria-label="Email"
          title="Email"
        >
          <Mail className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Email</span>
        </a>
        <a
          className="flex items-center gap-2 transition-colors hover:text-foreground"
          href="/resume"
          aria-label="Resume"
          title="Resume"
        >
          <FileText className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Resume</span>
        </a>
      </div>
    </footer>
  )
}
