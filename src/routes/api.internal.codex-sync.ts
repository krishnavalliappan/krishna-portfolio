import { createFileRoute } from "@tanstack/react-router"

import { replaceActivity } from "@/features/codex-activity/activity.repository.server"
import { activitySnapshotSchema } from "@/features/codex-activity/activity.schema"
import {
  isFreshTimestamp,
  verifyActivitySignature,
} from "@/features/codex-activity/signature"

export const Route = createFileRoute("/api/internal/codex-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CODEX_SYNC_SECRET
        if (!secret)
          return new Response("Sync is not configured", { status: 503 })

        const contentLength = Number(request.headers.get("content-length") ?? 0)
        if (contentLength > 200_000)
          return new Response("Payload too large", { status: 413 })

        const timestamp = request.headers.get("x-sync-timestamp") ?? ""
        const signature = request.headers.get("x-sync-signature") ?? ""
        const body = await request.text()

        if (
          !isFreshTimestamp(timestamp) ||
          !verifyActivitySignature(timestamp, body, signature, secret)
        ) {
          return new Response("Invalid signature", { status: 401 })
        }

        let payload: unknown
        try {
          payload = JSON.parse(body)
        } catch {
          return new Response("Invalid JSON", { status: 400 })
        }
        const parsed = activitySnapshotSchema.safeParse(payload)
        if (!parsed.success)
          return new Response("Invalid payload", { status: 400 })

        await replaceActivity(parsed.data)
        return new Response(null, { status: 204 })
      },
    },
  },
})
