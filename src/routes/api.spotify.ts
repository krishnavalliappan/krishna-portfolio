import { createFileRoute } from "@tanstack/react-router"

import { getNowPlaying } from "@/features/spotify/spotify.server"

export const Route = createFileRoute("/api/spotify")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(await getNowPlaying(), {
          headers: {
            "cache-control":
              "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
          },
        }),
    },
  },
})
