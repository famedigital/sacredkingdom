# Sacred Kingdom Travel

Next.js 16 site and admin CMS for **Sacred Kingdom Travel** (Bhutan).

- **GitHub:** [famedigital/sacredkingdom](https://github.com/famedigital/sacredkingdom)
- **Stack:** App Router, TypeScript, Tailwind 4, shadcn/ui, Supabase, Cloudinary
- **Agents:** start with [`AGENT_MEMORY.md`](./AGENT_MEMORY.md). Next.js APIs: read `node_modules/next/dist/docs/` (this is Next 16).

## Setup

1. Copy env from the operator into `.env.local` (never commit it). Variable names: [`VERCEL_ENV_SETUP.md`](./VERCEL_ENV_SETUP.md).
2. `npm install`
3. `npm run dev` → site `/`, admin `/admin/login`

Schema: `DEPLOY_DATABASE.sql` plus incremental files in `migrations/`.

## Scripts

| Command | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
