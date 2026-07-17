import { z } from "zod"

export const spotifyTrackSchema = z.object({
  name: z.string(),
  duration_ms: z.number(),
  external_urls: z.object({ spotify: z.url() }),
  artists: z.array(z.object({ name: z.string() })),
  album: z.object({
    name: z.string(),
    images: z.array(
      z.object({
        url: z.url(),
        width: z.number().nullable(),
        height: z.number().nullable(),
      })
    ),
  }),
})

export const spotifyResponseSchema = z.object({
  is_playing: z.boolean(),
  progress_ms: z.number().nullable(),
  item: spotifyTrackSchema.nullable(),
})

export const recentlyPlayedResponseSchema = z.object({
  items: z.array(z.object({ track: spotifyTrackSchema })),
})

export type NowPlaying =
  | { status: "unconfigured" | "idle" | "unavailable" }
  | {
      status: "playing" | "paused" | "recent"
      title: string
      artist: string
      album: string
      albumArt: string | null
      url: string
      progressMs: number
      durationMs: number
    }
