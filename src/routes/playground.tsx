import { createFileRoute } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { SectionHeading } from "@/components/site/section-heading"
import { SiteHeader } from "@/components/site/site-header"
import { DrawingPad } from "@/features/lab/drawing-pad"

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Playground - Krishnakumar Valliappan" },
      {
        name: "description",
        content:
          "Small browser experiments that run entirely on the client. Nothing here is sent to a server.",
      },
    ],
  }),
  component: PlaygroundPage,
})

function PlaygroundPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell min-h-svh scroll-mt-14">
        <section
          data-xray="CSR · browser only · no network"
          className="px-5 py-16 sm:px-8 lg:px-14 lg:py-24"
        >
          <a
            href="/"
            className="mb-14 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> cd /home
          </a>
          <SectionHeading
            index="00"
            label="Playground"
            title="Things that only run in your browser."
          />
          <div className="border bg-card p-6 sm:p-9">
            <DrawingPad />
          </div>
        </section>
      </main>
    </>
  )
}
