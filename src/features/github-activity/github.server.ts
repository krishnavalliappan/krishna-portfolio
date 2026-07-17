import { site } from "@/content/site"

import { contributionsResponseSchema } from "./github.schema"
import type { PublicGithubActivity } from "./github.schema"

const CONTRIBUTIONS_QUERY = `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`

/**
 * GitHub caps a contributions query at one year, which is also the window the
 * heatmap draws.
 */
export async function getGithubActivity(
  now = new Date()
): Promise<PublicGithubActivity> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return { status: "unconfigured" }

  const to = now
  const from = new Date(to.getTime() - 364 * 86_400_000)

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: {
          login: site.githubLogin,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) return { status: "unavailable" }

    return mapContributionsResponse(
      await response.json(),
      to.toISOString(),
      site.githubLogin
    )
  } catch {
    return { status: "unavailable" }
  }
}

export function mapContributionsResponse(
  input: unknown,
  collectedAt: string,
  login: string
): PublicGithubActivity {
  const parsed = contributionsResponseSchema.safeParse(input)
  if (!parsed.success || !parsed.data.data.user)
    return { status: "unavailable" }

  const calendar =
    parsed.data.data.user.contributionsCollection.contributionCalendar
  return {
    status: "ok",
    login,
    collectedAt,
    totalContributions: calendar.totalContributions,
    daily: calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        contributions: day.contributionCount,
      }))
    ),
  }
}
