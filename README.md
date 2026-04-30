# Investika

Investika is a SvelteKit application for exploring and comparing investment opportunities, regions, and policy content for the Indonesia investment portal.

## Stack

- SvelteKit 2 + Svelte 5
- Tailwind CSS 4
- Drizzle ORM + Postgres
- Better Auth
- Supabase client integration
- Netlify deployment adapter
- Paraglide i18n

## Local Development

1. Install dependencies:

```sh
bun install
```

2. Copy the example environment file and fill in your values:

```sh
cp .env.example .env
```

3. Start the dev server:

```sh
bun run dev
```

## Environment Variables

Required for normal app behavior:

- `DATABASE_URL`
- `ORIGIN`
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `BETTER_AUTH_SECRET`

Required for AI search:

- `GEMINI_API_KEY`

Optional AI overrides:

- `GEMINI_MODEL`
- `GEMINI_BASE_URL`

## Database Commands

```sh
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
```

## Quality Checks

```sh
bun run check
bun run lint
bun run test:unit
```

Run end-to-end tests only when Playwright is set up locally:

```sh
bun run test:e2e
```

## Deployment

This project is configured for Netlify.

- Build command: `bun run build`
- Publish directory: `build`

Set production environment variables in Netlify rather than relying on local `.env` files.

## Notes

- The current login flow includes prototype behavior and should be reviewed before hardening production auth.
- Some pages intentionally fall back to mock data when the database is unavailable.
