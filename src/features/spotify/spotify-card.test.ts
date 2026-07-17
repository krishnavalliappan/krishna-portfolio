import { expect, test } from "vitest"

import { advancePlayback } from "./spotify-card"
import type { NowPlaying } from "./spotify.schema"

test("advances active playback without exceeding the track duration", () => {
  const playback: NowPlaying = {
    status: "playing",
    title: "Track",
    artist: "Artist",
    album: "Album",
    albumArt: null,
    url: "https://open.spotify.com/track/example",
    progressMs: 9_500,
    durationMs: 10_000,
  }

  expect(advancePlayback(playback, 1_000)).toMatchObject({
    status: "playing",
    progressMs: 10_000,
  })
})
