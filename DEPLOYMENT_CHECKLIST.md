# Deployment checklist — Sacred Kingdom Travel

**GitHub:** https://github.com/famedigital/sacredkingdom (`master`)  
**Supabase:** `ugsjyzuyorfwzxfonpbz`  
**Cloudinary:** `hqxti5zm` / `sacred-himalaya/`

## Before go-live

1. Confirm `.env.local` is **not** in git (`git status`).
2. Copy env **names** from `VERCEL_ENV_SETUP.md` into Vercel; paste values from `.env.local` in the dashboard only.
3. Apply any unrun `migrations/*.sql` on the live database (do not re-run full `DEPLOY_DATABASE.sql` on a DB that already has data).
4. `npm run build` locally.
5. Push with `gh auth switch --user famedigital` then `git push origin master` (or Vercel Git integration).
6. Set `NEXT_PUBLIC_APP_URL` to the production origin.
7. Log in at `/admin/login` and spot-check tours, media upload, and Operations → Add client.

## After deploy

- Homepage, `/tours`, `/contact`, `/admin/operations`
- Password reset needs SMTP or Resend if you use it
