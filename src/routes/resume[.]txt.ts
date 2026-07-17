import { createFileRoute } from "@tanstack/react-router"

import { resume } from "@/features/resume/resume-data"
import { formatResumeText } from "@/features/resume/resume-format"

export const Route = createFileRoute("/resume.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(formatResumeText(resume), {
          headers: { "content-type": "text/plain; charset=utf-8" },
        }),
    },
  },
})
