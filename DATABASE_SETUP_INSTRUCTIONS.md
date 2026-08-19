# Database setup

**Live Supabase project ref:** `ugsjyzuyorfwzxfonpbz`  
**Do not** use the old `iqbwlmoadphkuewubszd` project from early Wangchuk docs.

## New environment

1. Open [Supabase SQL Editor](https://supabase.com/dashboard) for `ugsjyzuyorfwzxfonpbz`.
2. Run `DEPLOY_DATABASE.sql` once on a **new** database only.
3. Run each file in `migrations/` that has not been applied (in date order).

## Existing live database

Do **not** re-run the full `DEPLOY_DATABASE.sql`. Apply only missing `migrations/*.sql`.

## After schema

- Admin users live in `admin_users`.
- Master guests: `clients`.
- Env vars: see `VERCEL_ENV_SETUP.md` (names only; keys stay out of git).
