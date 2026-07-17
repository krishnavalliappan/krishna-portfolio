"use client"

import { useMemo, useRef, useState } from "react"

import {
  buildThresholds,
  buildWeeks,
  compactNumber,
  lastActiveIndex,
  levelOf,
  monthLabels,
  valueOf,
} from "./calendar"
import type { HeatmapDay, Metric } from "./calendar"

/** Sunday-first rows; alternate weekdays go unlabelled to fit an 11px cell. */
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]

/**
 * Level is mixed into the background rather than set as element opacity, which
 * would dim the cell's own ring along with it — leaving a quiet day's hover
 * state invisible at the bottom of the scale.
 */
const LEVEL_PERCENT = [6, 28, 50, 74, 100]

function levelBackground(level: number) {
  return `color-mix(in oklab, var(--primary) ${LEVEL_PERCENT[level]}%, transparent)`
}

/** Weeks are columns, so left/right walks a week and up/down walks a day. */
const KEY_STEPS = new Map([
  ["ArrowUp", -1],
  ["ArrowDown", 1],
  ["ArrowLeft", -7],
  ["ArrowRight", 7],
])

export function ActivityHeatmap({
  days,
  metric,
}: {
  days: readonly HeatmapDay[]
  metric: Metric
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(() => lastActiveIndex(days, metric))
  const [hovered, setHovered] = useState<number | null>(null)

  const weeks = useMemo(() => buildWeeks(days), [days])
  const months = useMemo(() => monthLabels(weeks), [weeks])
  const thresholds = useMemo(
    () => buildThresholds(days.map((day) => valueOf(day, metric))),
    [days, metric]
  )

  const inspected = days[hovered ?? focused]

  /**
   * Roving tabindex: 365 tabbable cells would bury the rest of the page, so one
   * cell holds the tab stop and arrows walk the grid.
   */
  function onKeyDown(event: React.KeyboardEvent) {
    const step = KEY_STEPS.get(event.key)
    if (step === undefined) return

    event.preventDefault()
    const next = Math.min(days.length - 1, Math.max(0, focused + step))
    setFocused(next)
    // A stale pointer position outranks the keyboard otherwise, freezing the
    // inspector on whatever the mouse last touched.
    setHovered(null)
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-index="${next}"]`)
      ?.focus()
  }

  return (
    <div>
      <Inspector day={inspected} />
      {/* The ring is a box-shadow drawn outside the cell, and the last column
          sits flush against this scroll container's content edge. Without a
          gutter wider than the ring, its right side is clipped away. */}
      <div className="mt-4 overflow-x-auto pr-0.5 pb-1">
        <div className="inline-flex min-w-full flex-col gap-1">
          <div className="flex gap-[3px] pl-9 font-mono text-[10px] text-muted-foreground">
            {weeks.map((_, index) => {
              const label = months.find((month) => month.index === index)
              return (
                <span key={index} className="min-w-[11px] flex-1">
                  {label ? (
                    <span className="relative -left-px whitespace-nowrap">
                      {label.label}
                    </span>
                  ) : null}
                </span>
              )
            })}
          </div>
          <div className="flex items-stretch gap-[3px]">
            {/* Rows stretch to the grid's height, so labels track the cells
                as the columns grow to fill the card. */}
            <div className="grid shrink-0 grid-rows-7 gap-[3px] pr-1 font-mono text-[10px] text-muted-foreground">
              {WEEKDAY_LABELS.map((label, index) => (
                <span
                  key={index}
                  className="flex w-8 items-center leading-none"
                >
                  {label}
                </span>
              ))}
            </div>
            <div
              ref={gridRef}
              role="grid"
              aria-label={`${days.length} days of ${metric === "tokens" ? "agent token" : "GitHub contribution"} activity. Use arrow keys to inspect a day.`}
              className="flex flex-1 gap-[3px]"
              onKeyDown={onKeyDown}
              onPointerLeave={() => setHovered(null)}
            >
              {weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  role="row"
                  className="grid min-w-[11px] flex-1 grid-rows-7 gap-[3px]"
                >
                  {week.map((cell, dayIndex) =>
                    cell === null ? (
                      <span key={dayIndex} className="aspect-square w-full" />
                    ) : (
                      <Cell
                        key={cell.day.date}
                        day={cell.day}
                        index={cell.index}
                        metric={metric}
                        level={levelOf(valueOf(cell.day, metric), thresholds)}
                        isFocusTarget={cell.index === focused}
                        isInspected={cell.index === (hovered ?? focused)}
                        onInspect={setHovered}
                        onFocus={() => setFocused(cell.index)}
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Legend />
    </div>
  )
}

function Cell({
  day,
  index,
  metric,
  level,
  isFocusTarget,
  isInspected,
  onInspect,
  onFocus,
}: {
  day: HeatmapDay
  index: number
  metric: Metric
  level: 0 | 1 | 2 | 3 | 4
  isFocusTarget: boolean
  isInspected: boolean
  onInspect: (index: number | null) => void
  onFocus: () => void
}) {
  return (
    <button
      type="button"
      role="gridcell"
      data-index={index}
      tabIndex={isFocusTarget ? 0 : -1}
      aria-label={`${day.date}: ${describe(day, metric)}`}
      onPointerEnter={() => onInspect(index)}
      onFocus={onFocus}
      // The ring is what ties the cell under the cursor to the readout above
      // it; without it the reading appears somewhere else for no visible reason.
      className={`aspect-square w-full cursor-pointer border border-primary/10 outline-none ${
        isInspected ? "ring-1 ring-foreground" : ""
      }`}
      style={{ backgroundColor: levelBackground(level) }}
    />
  )
}

/**
 * A fixed status line rather than a floating tooltip: it never clips against
 * the horizontal scroll container, and hover, focus and touch all land in the
 * same place.
 */
function Inspector({ day }: { day: HeatmapDay | undefined }) {
  if (!day)
    return (
      <p className="font-mono text-xs text-muted-foreground">
        No days to show.
      </p>
    )

  return (
    <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border bg-background/50 px-3 py-2 font-mono text-xs tabular-nums">
      <div className="flex gap-2">
        <dt className="text-muted-foreground">date</dt>
        <dd>{day.date}</dd>
      </div>
      {/* Fixed widths: the values change under a moving cursor, and without
          them every cell would nudge the whole row sideways. */}
      <div className="flex gap-2">
        <dt className="text-muted-foreground">tokens</dt>
        <dd className="w-14 text-primary">{compactNumber(day.tokens)}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="text-muted-foreground">contributions</dt>
        <dd
          className={`w-8 ${day.contributions === null ? "text-muted-foreground" : ""}`}
        >
          {day.contributions === null ? "n/a" : day.contributions}
        </dd>
      </div>
    </dl>
  )
}

function Legend() {
  return (
    <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
      <span>Less</span>
      {LEVEL_PERCENT.map((percent, level) => (
        <span
          key={percent}
          className="size-[11px] border border-primary/10"
          style={{ backgroundColor: levelBackground(level) }}
        />
      ))}
      <span>More</span>
    </div>
  )
}

function describe(day: HeatmapDay, metric: Metric) {
  return metric === "tokens"
    ? `${day.tokens.toLocaleString()} tokens`
    : `${day.contributions ?? 0} contributions`
}
