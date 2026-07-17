import { z } from "zod"

/** Shape of the GitHub GraphQL contributions calendar response. */
export const contributionsResponseSchema = z.object({
  data: z.object({
    user: z
      .object({
        contributionsCollection: z.object({
          contributionCalendar: z.object({
            totalContributions: z.number().int().nonnegative(),
            weeks: z.array(
              z.object({
                contributionDays: z.array(
                  z.object({
                    date: z.iso.date(),
                    contributionCount: z.number().int().nonnegative(),
                  })
                ),
              })
            ),
          }),
        }),
      })
      .nullable(),
  }),
})

export const githubDailySchema = z.object({
  date: z.iso.date(),
  contributions: z.number().int().nonnegative(),
})

export type GithubDaily = z.infer<typeof githubDailySchema>

export type PublicGithubActivity =
  | { status: "unconfigured" }
  | { status: "unavailable" }
  | {
      status: "ok"
      login: string
      collectedAt: string
      totalContributions: number
      daily: GithubDaily[]
    }
