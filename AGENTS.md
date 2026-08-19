<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sacred Kingdom Travel — agent entry

Read **`AGENT_MEMORY.md`** at the start of a session. It is the source of truth for brand, GitHub, backend, and Operations. Do not follow `AGENT_MEMORY.md` / `PROJECT_STATUS.md` content that still says Wangchuk Tours, mock admin, or the old GitHub remote.

## Hard rules

- Client brand: **Sacred Kingdom Travel** (SKT). Any stored CRM name matching `/wangchuk/i` must display as Sacred Kingdom (`normalizeCompanyName` in `lib/brand-defaults.ts`).
- Do **not** commit `.env.local`, service-role keys, Cloudinary secrets, JWT secrets, or admin passwords.
- Do **not** edit Cursor plan files (`.plan.md` / `*.plan.md`).
- CSS: keep the `.gold-rule {` opening brace intact in `app/globals.css`.
- GitHub remote: `https://github.com/famedigital/sacredkingdom.git` on branch `master`. Push with the `famedigital` GitHub CLI account.
- Public site is a luxury black / gold / ivory folio, **not** a red “prayer-red” theme.
