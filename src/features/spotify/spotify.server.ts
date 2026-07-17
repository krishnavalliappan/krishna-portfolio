import { z } from "zod"

import {
  recentlyPlayedResponseSchema,
  spotifyResponseSchema,
} from "./spotify.schema"
import type { NowPlaying, spotifyTrackSchema } from "./spotify.schema"

const tokenSchema = z.object({ access_token: z.string().min(1) })

export async function getNowPlaying(): Promise<NowPlaying> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken)
    return { status: "unconfigured" }

  try {
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
        signal: AbortSignal.timeout(8_000),
      }
    )
    if (!tokenResponse.ok) return { status: "unavailable" }
    const { access_token } = tokenSchema.parse(await tokenResponse.json())

    const playbackResponse = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { authorization: `Bearer ${access_token}` },
        signal: AbortSignal.timeout(8_000),
      }
    )
    if (playbackResponse.status === 204) return getRecentlyPlayed(access_token)
    if (!playbackResponse.ok) return { status: "unavailable" }

    const playback = mapSpotifyResponse(await playbackResponse.json())
    return playback.status === "idle"
      ? getRecentlyPlayed(access_token)
      : playback
  } catch {
    return { status: "unavailable" }
  }
}

export function mapSpotifyResponse(input: unknown): NowPlaying {
  const playback = spotifyResponseSchema.parse(input)
  if (!playback.item) return { status: "idle" }

  return mapTrack(
    playback.item,
    playback.is_playing ? "playing" : "paused",
    playback.progress_ms ?? 0
  )
}

export function mapRecentlyPlayedResponse(input: unknown): NowPlaying {
  const track = recentlyPlayedResponseSchema.parse(input).items.at(0)?.track
  return track ? mapTrack(track, "recent", 0) : { status: "idle" }
}

async function getRecentlyPlayed(accessToken: string): Promise<NowPlaying> {
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
    {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    }
  )
  return response.ok
    ? mapRecentlyPlayedResponse(await response.json())
    : { status: "idle" }
}

function mapTrack(
  track: z.infer<typeof spotifyTrackSchema>,
  status: "playing" | "paused" | "recent",
  progressMs: number
): NowPlaying {
  return {
    status,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    album: track.album.name,
    albumArt: track.album.images[0]?.url ?? null,
    url: track.external_urls.spotify,
    progressMs,
    durationMs: track.duration_ms,
  }
}
