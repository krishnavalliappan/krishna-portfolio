"use client"

import { useEffect, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"

import type { NowPlaying } from "./spotify.schema"

export function SpotifyCard() {
  const [playback, setPlayback] = useState<NowPlaying | null>(null)

  useEffect(() => {
    let active = true
    const refresh = () => {
      fetch("/api/spotify")
        .then((response) => response.json() as Promise<NowPlaying>)
        .then((result) => {
          if (!active) return
          setPlayback((current) =>
            (result.status === "idle" || result.status === "unavailable") &&
            current &&
            "title" in current
              ? { ...current, status: "recent", progressMs: 0 }
              : result
          )
        })
        .catch(
          () =>
            active &&
            setPlayback((current) =>
              current && "title" in current
                ? { ...current, status: "recent", progressMs: 0 }
                : { status: "unavailable" }
            )
        )
    }

    refresh()
    const refreshInterval = window.setInterval(refresh, 20_000)
    const progressInterval = window.setInterval(
      () => setPlayback((current) => advancePlayback(current, 1_000)),
      1_000
    )
    return () => {
      active = false
      window.clearInterval(refreshInterval)
      window.clearInterval(progressInterval)
    }
  }, [])

  if (!playback)
    return (
      <div className="grid min-h-[5.75rem] grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 border bg-card p-3">
        <Skeleton className="size-16 rounded-none" />
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-none" />
          <Skeleton className="h-3 w-1/2 rounded-none" />
        </div>
        <div className="size-5" aria-hidden="true" />
      </div>
    )

  if (!("title" in playback)) {
    const message =
      playback.status === "unconfigured"
        ? "Spotify is not connected yet."
        : playback.status === "idle"
          ? "Nothing is playing right now."
          : "Playback is temporarily unavailable."
    return (
      <div className="grid min-h-[5.75rem] grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 border bg-card p-3">
        <div className="grid size-16 place-items-center bg-secondary">
          <SpotifyIcon className="size-6 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Spotify
          </p>
          <p className="mt-1 text-sm font-medium">Nothing playing</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {message}
          </p>
        </div>
        <div className="size-5" aria-hidden="true" />
      </div>
    )
  }

  return (
    <a
      href={playback.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${playback.title} on Spotify`}
      className="group relative grid min-h-[5.75rem] grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden border bg-card p-3 transition-colors before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-primary hover:border-primary/50 hover:bg-secondary/70"
    >
      <div className="relative size-16 overflow-hidden bg-secondary">
        {playback.albumArt ? (
          <img
            src={playback.albumArt}
            alt=""
            className="size-full object-cover saturate-75 transition group-hover:saturate-100"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <SpotifyIcon className="size-6 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex h-7 items-end justify-center bg-linear-to-t from-black/80 to-transparent pb-1.5">
          <div className="flex h-4 items-end gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3].map((bar) => (
              <span
                key={bar}
                className={
                  playback.status === "playing"
                    ? "equalizer-bar"
                    : "h-1 w-0.5 bg-primary"
                }
              />
            ))}
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <p className="font-mono text-xs tracking-wider text-primary uppercase">
          {playback.status === "playing"
            ? "Now playing"
            : playback.status === "paused"
              ? "Paused"
              : "Last played"}
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{playback.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {playback.artist} · {playback.album}
        </p>
        {playback.status !== "recent" && (
          <div className="mt-2 h-0.5 bg-border">
            <div
              className="h-full bg-primary transition-[width] duration-1000 ease-linear"
              style={{
                width: `${Math.min(100, (playback.progressMs / playback.durationMs) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>
      <SpotifyIcon className="size-5 shrink-0 text-primary" />
    </a>
  )
}

export function advancePlayback(
  playback: NowPlaying | null,
  elapsedMs: number
): NowPlaying | null {
  if (!playback || !("title" in playback) || playback.status !== "playing")
    return playback

  return {
    ...playback,
    progressMs: Math.min(playback.durationMs, playback.progressMs + elapsedMs),
  }
}

function SpotifyIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.5-1.15a.75.75 0 1 1-.33-1.46c4.5-1.03 8.4-.58 11.5 1.32a.75.75 0 0 1 .33 1.04Zm1.47-3.27a.94.94 0 0 1-1.29.3c-3.2-1.96-8.07-2.53-11.85-1.38a.94.94 0 1 1-.54-1.79c4.3-1.3 9.7-.67 13.37 1.58a.94.94 0 0 1 .31 1.29Zm.13-3.4C15.3 8.35 9.02 8.13 5.35 9.24a1.12 1.12 0 1 1-.65-2.15c4.2-1.27 11.2-1.03 15.6 1.58a1.12 1.12 0 0 1-1.2 1.96Z" />
    </svg>
  )
}
