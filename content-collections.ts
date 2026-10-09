import { defineCollection, defineConfig } from "@content-collections/core"
import { compileMDX } from "@content-collections/mdx"
import { z } from "zod"

const baseSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  publishedAt: z.string().date(),
  updatedAt: z.string().date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string().min(1)).min(1),
  content: z.string().min(1),
})

const writing = defineCollection({
  name: "writing",
  directory: "content/writing",
  include: "**/*.mdx",
  schema: baseSchema,
  transform: async (document, context) => ({
    ...document,
    slug: document._meta.path,
    body: await compileMDX(context, document),
  }),
})

const caseStudies = defineCollection({
  name: "caseStudies",
  directory: "content/case-studies",
  include: "**/*.mdx",
  schema: baseSchema.extend({
    role: z.string().min(1),
    stack: z.array(z.string().min(1)).min(1),
    outcome: z.string().min(1),
    image: z.string().optional(),
  }),
  transform: async (document, context) => ({
    ...document,
    slug: document._meta.path,
    body: await compileMDX(context, document),
  }),
})

export default defineConfig({ content: [writing, caseStudies] })
