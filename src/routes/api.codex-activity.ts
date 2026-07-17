import { createFileRoute } from "@tanstack/react-router"

import { readActivity } from "@/features/codex-activity/activity.repository.server"

export const Route = createFileRoute("/api/codex-activity")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await readActivity(), {
            headers: {
              "cache-control":
                "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
            },
          })
        } catch (error) {
          console.error("Codex activity read failed", error)
          return Response.json(
            { status: "unavailable" },
            { status: 503, headers: { "cache-control": "no-store" } }
          )
        }
      },
    },
  },
})
