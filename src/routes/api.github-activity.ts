import { createFileRoute } from "@tanstack/react-router"

import { getGithubActivity } from "@/features/github-activity/github.server"

export const Route = createFileRoute("/api/github-activity")({
  server: {
    handlers: {
      GET: async () => {
        const activity = await getGithubActivity()
        return Response.json(activity, {
          headers: {
            "cache-control":
              activity.status === "ok"
                ? "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
                : "no-store",
          },
        })
      },
    },
  },
})
