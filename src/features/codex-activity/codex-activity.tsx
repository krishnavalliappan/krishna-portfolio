"use client"

import { useEffect, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import {
  buildWindow,
  compactNumber,
  summarize,
  todayIso,
} from "@/features/activity/calendar"
import type { Metric } from "@/features/activity/calendar"
import { ActivityHeatmap } from "@/features/activity/heatmap"
import type { PublicGithubActivity } from "@/features/github-activity/github.schema"

import type { PublicActivity } from "./activity.schema"

export function CodexActivity() {
  const [activity, setActivity] = useState<PublicActivity | null>(null)
  const [github, setGithub] = useState<PublicGithubActivity | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch("/api/codex-activity")
      .then((response) => {
        if (!response.ok) throw new Error("Activity unavailable")
        return response.json() as Promise<PublicActivity>
      })
      .then(setActivity)
      .catch(() => setFailed(true))
  }, [])

  // GitHub is a separate source with its own failure mode. It resolves on its
  // own so a GitHub outage never blanks the token heatmap.
  useEffect(() => {
    fetch("/api/github-activity")
      .then((response) => {
        if (!response.ok) throw new Error("GitHub unavailable")
        return response.json() as Promise<PublicGithubActivity>
      })
      .then(setGithub)
      .catch(() => setGithub({ status: "unavailable" }))
  }, [])

  if (failed)
    return (
      <ActivityMessage
        label="offline"
        message="Activity could not be loaded. The rest of the portfolio is unaffected."
      />
    )
  if (!activity)
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-48 rounded-none" />
        <Skeleton className="h-52 rounded-none" />
      </div>
    )
  if (activity.status === "empty")
    return (
      <ActivityMessage
        label="not synced"
        message="The local collector has not published its first complete snapshot."
      />
    )

  return <ActivitySnapshot activity={activity} github={github} />
}

function ActivitySnapshot({
  activity,
  github,
}: {
  activity: Extract<PublicActivity, { status: "ok" }>
  github: PublicGithubActivity | null
}) {
  const [metric, setMetric] = useState<Metric>("tokens")

  const contributions = github?.status === "ok" ? github.daily : null
  const days = buildWindow(activity.daily, contributions, todayIso())
  const window = summarize(days, metric)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-medium">
            {metric === "tokens"
              ? "Agent activity / 365d"
              : "GitHub contributions / 365d"}
          </p>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {metric === "tokens"
              ? "Token throughput across local coding-agent sessions."
              : `Public activity on github.com/${github?.status === "ok" ? github.login : ""}. Work at IPAC lives on private Bitbucket and is not counted here.`}
          </p>
        </div>
        <MetricToggle
          metric={metric}
          onChange={setMetric}
          githubStatus={github?.status ?? "loading"}
        />
      </div>
      <dl className="mb-6 grid grid-cols-3 gap-px border bg-border">
        {metric === "tokens" ? (
          <>
            <Metric
              label="Lifetime"
              value={compactNumber(activity.lifetimeTokens)}
            />
            <Metric
              label="Current streak"
              value={`${activity.currentStreakDays}d`}
            />
            <Metric
              label="Longest streak"
              value={`${activity.longestStreakDays}d`}
            />
          </>
        ) : (
          <>
            <Metric label="Total / 365d" value={compactNumber(window.total)} />
            <Metric label="Active days" value={`${window.activeDays}d`} />
            <Metric label="Longest streak" value={`${window.longestStreak}d`} />
          </>
        )}
      </dl>
      <ActivityHeatmap days={days} metric={metric} />
      <p className="mt-5 font-mono text-xs text-muted-foreground">
        Sync at {formatSyncTime(activity.collectedAt)}
      </p>
    </div>
  )
}

function MetricToggle({
  metric,
  onChange,
  githubStatus,
}: {
  metric: Metric
  onChange: (metric: Metric) => void
  githubStatus: PublicGithubActivity["status"] | "loading"
}) {
  const githubReady = githubStatus === "ok"

  return (
    <div
      role="group"
      aria-label="Heatmap metric"
      className="flex border font-mono text-xs"
    >
      <ToggleButton
        active={metric === "tokens"}
        onClick={() => onChange("tokens")}
      >
        Tokens
      </ToggleButton>
      <ToggleButton
        active={metric === "contributions"}
        disabled={!githubReady}
        title={
          githubReady
            ? undefined
            : githubStatus === "loading"
              ? "Loading GitHub activity"
              : "GitHub activity is unavailable"
        }
        onClick={() => onChange("contributions")}
      >
        Commits
      </ToggleButton>
    </div>
  )
}

function ToggleButton({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  title?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={`cursor-pointer px-3 py-1.5 transition-colors not-first:border-l disabled:cursor-not-allowed disabled:text-muted-foreground/40 ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <dt className="font-mono text-xs text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-2 text-xl font-medium">{value}</dd>
    </div>
  )
}

function ActivityMessage({
  label,
  message,
}: {
  label: string
  message: string
}) {
  return (
    <div className="grid min-h-64 place-items-center border border-dashed p-8 text-center">
      <div>
        <p className="eyebrow text-primary">{label}</p>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  )
}

/**
 * The viewer's own local time, with the zone spelled out. Without the zone the
 * reader has no way to tell whether the clock is theirs, mine, or UTC.
 */
function formatSyncTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { timeZoneName: "short" })
}
