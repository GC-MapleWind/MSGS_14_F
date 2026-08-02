# Frontend deployment

The production build is a static SvelteKit site. This repository does not ship
with a GitHub Actions workflow or production credentials.

## Build

```bash
cd dpbr_front/app
npm ci
npm run check
npm run build
```

The generated site is written to `dpbr_front/app/build/`.

## Serve with Nginx

Use the provided Nginx files as starting points and update their upstream host,
domain, and TLS settings for the target environment. `setup_frontend.sh` is an
optional self-managed Linux host bootstrap script; review it before execution.

The frontend expects the backend API URL and prefix from environment variables.
Copy `dpbr_front/app/.env.example` to `.env` for local configuration and never
commit production secrets.
