import { describe, expect, it } from "vitest"

import { mapRecentlyPlayedResponse, mapSpotifyResponse } from "./spotify.server"

describe("mapSpotifyResponse", () => {
  it("returns only public playback fields", () => {
    const result = mapSpotifyResponse({
      is_playing: true,
      progress_ms: 1000,
      item: {
        name: "Track",
        duration_ms: 2000,
        external_urls: { spotify: "https://open.spotify.com/track/example" },
        artists: [{ name: "Artist" }],
        album: { name: "Album", images: [] },
      },
    })

    expect(result).toMatchObject({
      status: "playing",
      title: "Track",
      artist: "Artist",
    })
  })

  it("maps the latest recently played track", () => {
    const result = mapRecentlyPlayedResponse({
      items: [
        {
          track: {
            name: "Last Track",
            duration_ms: 2000,
            external_urls: {
              spotify: "https://open.spotify.com/track/example",
            },
            artists: [{ name: "Artist" }],
            album: { name: "Album", images: [] },
          },
        },
      ],
    })

    expect(result).toMatchObject({
      status: "recent",
      title: "Last Track",
      artist: "Artist",
    })
  })
})
