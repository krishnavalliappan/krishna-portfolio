import { createFileRoute, notFound } from "@tanstack/react-router"
import { allWritings } from "content-collections"

import { ContentPage } from "@/components/site/content-page"

export const Route = createFileRoute("/writing/$slug")({
  loader: ({ params }) => {
    const article = allWritings.find(
      (entry) =>
        entry.slug === params.slug && (import.meta.env.DEV || !entry.draft)
    )
    if (!article) throw notFound()
    return article
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Writing"} - Krishnakumar Valliappan` },
      { name: "description", content: loaderData?.summary },
    ],
  }),
  component: WritingPage,
})

function WritingPage() {
  const article = Route.useLoaderData()
  return (
    <ContentPage
      title={article.title}
      summary={article.summary}
      date={article.publishedAt}
      updatedAt={article.updatedAt}
      tags={article.tags}
      body={article.body}
      kind="Writing"
    />
  )
}
