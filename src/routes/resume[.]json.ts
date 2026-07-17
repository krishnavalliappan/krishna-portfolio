import { createFileRoute } from "@tanstack/react-router"

import { resume } from "@/features/resume/resume-data"

export const Route = createFileRoute("/resume.json")({
  server: {
    handlers: {
      GET: () => Response.json(resume),
    },
  },
})
