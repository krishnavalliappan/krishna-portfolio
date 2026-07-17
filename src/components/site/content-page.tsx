import { MDXContent } from "@content-collections/mdx/react"
import { ArrowLeft } from "lucide-react"

import { SiteHeader } from "@/components/site/site-header"

export function ContentPage({
  title,
  summary,
  date,
  tags,
  body,
  kind,
}: {
  title: string
  summary: string
  date: string
  tags: readonly string[]
  body: string
  kind: string
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell min-h-svh scroll-mt-14">
        <article className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
          <a
            href="/"
            className="mb-14 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> cd /home
          </a>
          <header className="border-b pb-12">
            <div className="eyebrow mb-6 flex flex-wrap gap-x-5 gap-y-2">
              <span className="text-primary">{kind}</span>
              <time>{date}</time>
              <span>{tags.join(" / ")}</span>
            </div>
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.05em] sm:text-6xl">
              {title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">
              {summary}
            </p>
          </header>
          <div className="prose-technical py-8">
            <MDXContent code={body} />
          </div>
        </article>
      </main>
    </>
  )
}
