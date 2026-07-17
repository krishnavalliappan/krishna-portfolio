import { createFileRoute, notFound } from "@tanstack/react-router"
import { allCaseStudies } from "content-collections"

import { ContentPage } from "@/components/site/content-page"

export const Route = createFileRoute("/case-studies/$slug")({
  loader: ({ params }) => {
    const study = allCaseStudies.find(
      (entry) => entry.slug === params.slug && !entry.draft
    )
    if (!study) throw notFound()
    return study
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.title ?? "Case Study"} - Krishnakumar Valliappan`,
      },
      { name: "description", content: loaderData?.summary },
    ],
  }),
  component: CaseStudyPage,
})

function CaseStudyPage() {
  const study = Route.useLoaderData()
  return (
    <ContentPage
      title={study.title}
      summary={study.summary}
      date={study.publishedAt}
      tags={study.tags}
      body={study.body}
      kind="Case study"
    />
  )
}
