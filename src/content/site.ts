export const site = {
  name: "Krishnakumar Valliappan",
  shortName: "krishnakumar.dev",
  title: "Krishnakumar Valliappan - Full-Stack Software Engineer",
  description:
    "Full-stack software engineer building AI-assisted products, APIs, data systems, and responsive interfaces.",
  location: "Toronto, Canada",
  coordinates: "43.6532°N 79.3832°W",
  airport: "YYZ",
  availability: { code: 200, label: "open to offers" },
  email: "krishnavalliappan02@gmail.com",
  phone: "+1 (514) 980-6433",
  website: "https://www.krishnakumar.dev",
  github: "https://github.com/krishnavalliappan",
  githubLogin: "krishnavalliappan",
  linkedin: "https://www.linkedin.com/in/krishnavalliappan/",
} as const

export const profile = {
  role: "Software Engineer",
  focus: "AI systems + product engineering",
  experienceLabel: "3+ years",
} as const

export const experience = [
  {
    id: "ipac",
    role: "Full-Stack Developer",
    company: "IPAC Consulting",
    location: "Canada",
    period: "Jan 2025 - Present",
    highlights: [
      "Built and shipped an AI-guided pricing assistant with FastAPI, Vue 3, SQLAlchemy, SSE, and structured LLM outputs, supporting 100+ sessions while reducing reliance on manual customer contact.",
      "Built a tenant-scoped document Q&A workflow using OpenAI file-search RAG, SSE streaming, company and site filters, and page-linked citations for uploaded PDFs.",
      "Shipped an embeddable iframe widget that gave external-site visitors responsive access to the assistant while preserving session context across visits.",
      "Built a full-stack image annotation system with Vue, Leaflet, Express, and Prisma, replacing a workflow that cross-referenced spreadsheets and image files.",
      "Built an interactive spatial data map that overlays live operational records on annotated layouts with filters, clustered markers, and drill-down details.",
      "Created a PDF.js and HTML Canvas viewer with lazy rendering for large documents and role-gated download and print controls.",
      "Reduced repeat API calls by about 30% on affected screens using localStorage caching with two-minute TTLs, namespaced keys, and mutation-triggered invalidation.",
      "Built an idempotent data ingestion pipeline that normalized external spreadsheet data into a relational quote cache and protected against stale-record overwrites.",
      "Implemented draft autosave and lifecycle workflows with debounced persistence, flush-on-exit, and server-authoritative transitions.",
      "Containerized FastAPI and Vue services with Docker Compose, Nginx, and Caddy; added Bitbucket checks for migrations, health tests, and frontend types before manual Coolify deployments.",
    ],
  },
  {
    id: "ia-flow",
    role: "Junior Developer",
    company: "IA Flow Elements",
    location: "India",
    period: "Jan 2021 - Jul 2022",
    highlights: [
      "Automated recurring AWS data synchronization with Python, removing manual execution from about 90% of scheduled runs.",
      "Built React dashboards with filtering and comparison views for operational data analysis.",
      "Rebuilt internal interfaces with Tailwind CSS to improve mobile responsiveness and standardize component styling.",
      "Resolved production issues across internal tools by tracing data and UI defects and shipping fixes with business stakeholders.",
    ],
  },
] as const

export const education = [
  {
    degree: "Master of Engineering",
    institution: "Concordia University",
    location: "Montreal, Canada",
    period: "2022 - 2024",
  },
] as const

export const projects = [
  {
    slug: "pdf-pipeline",
    title: "PDF Document Pipeline",
    context: "Professional",
    year: "2026",
    role: "Full-Stack Developer",
    outcome: "AI answers cite exact PDF page numbers",
    description:
      "Document pipeline for a compliance platform: programmatic audit-report PDFs built on PDFKit primitives, page-level text indexing with a fuzzy citation matcher that grounds AI answers to exact pages, and an authenticated PDF.js viewer with role-gated controls.",
    stack: ["Node.js", "PDFKit", "pdf-parse", "PDF.js", "Vue 3"],
  },
  {
    slug: "ai-pricing-assistant",
    title: "AI Pricing Assistant",
    context: "Professional",
    year: "2025",
    role: "Full-Stack Developer",
    outcome: "100+ guided sessions, less manual customer contact",
    description:
      "Guided pricing with structured LLM outputs streamed over SSE, reducing reliance on manual customer contact across 100+ sessions.",
    stack: ["FastAPI", "Vue 3", "SSE", "SQLAlchemy"],
  },
  {
    slug: "jobscout",
    title: "JobScout",
    context: "Open source",
    year: "2024",
    role: "Solo build",
    outcome: "45+ GitHub stars",
    description:
      "Job research and application tracking that extracts structured job data, drafts application materials with OpenAI, and syncs tracking with Notion.",
    stack: ["Python", "Selenium", "OpenAI", "Notion API"],
    url: "https://github.com/krishnavalliappan/JobScout",
  },
] as const

export const skillGroups = [
  {
    label: "Languages",
    skills: ["Python", "TypeScript", "JavaScript", "SQL"],
  },
  {
    label: "Backend",
    skills: [
      "FastAPI",
      "Express.js",
      "Node.js",
      "REST APIs",
      "Server-Sent Events",
      "Pydantic",
      "Prisma",
      "SQLAlchemy",
    ],
  },
  {
    label: "Frontend",
    skills: [
      "Vue 3",
      "React",
      "Next.js",
      "Pinia",
      "Tailwind CSS",
      "Leaflet",
      "HTML5 Canvas",
    ],
  },
  {
    label: "AI",
    skills: [
      "OpenAI APIs",
      "LLM workflow orchestration",
      "Function calling",
      "Structured outputs",
      "RAG",
    ],
  },
  {
    label: "Data and cloud",
    skills: [
      "PostgreSQL",
      "MySQL",
      "SQLite",
      "Docker",
      "AWS",
      "CI/CD",
      "Nginx",
      "Git",
    ],
  },
] as const
