# krishnakumar.dev

Full-stack engineering portfolio built with TanStack Start, React, Tailwind CSS, shadcn/ui, MDX Content Collections, Turso, and Drizzle.

## Local development

```sh
pnpm install
pnpm db:migrate
pnpm dev
```

Turso and Spotify are optional locally. Without environment variables the app uses `file:local.db` and renders an explicit disconnected Spotify state. See `.env.example` for supported variables.

## Verify

```sh
pnpm typecheck
pnpm test
pnpm lint
pnpm build
pnpm test:e2e
```

## Content and resume

- Profile, experience, projects, and skills: `src/content/site.ts`
- Writing release snapshots: generated from the sibling `personal-blogs` repository
- Case studies: `content/case-studies/`
- HTML resume: `/resume`
- Machine-readable resume: `/resume.txt` and `/resume.json`
- PDF: run `pnpm resume:pdf` while the local server is running

## Integrations

- Codex collector: `docs/operations/codex-sync.md`
- Vercel, Turso, and Spotify: `docs/operations/deployment.md`

Codex credentials stay on the local machine. Only anonymous aggregate activity is signed and uploaded.
