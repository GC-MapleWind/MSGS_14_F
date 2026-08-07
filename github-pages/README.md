# 단풍바람 14기 Shorts demo

This directory is an independent static GitHub Pages demo of the current
YouTube Shorts-style frontend. It does not modify or depend on the local
Svelte mockup served at `localhost:5173`.

The demo keeps the original screen flow available without a backend:

- Home and integrated search
- Kangmin's 12 settlement Shorts with vertical snap navigation
- Kangmin's member profile, sorting, and direct Shorts links
- Kangmin's character-card preview and PNG download
- The admin-team profile and Kangmin's team message
- Talk, demo login, local comment posting, and demo sign-up
- Browser history plus a GitHub Pages deep-link fallback
- Theme, likes, login state, and demo comments persisted in `localStorage`

Only Kangmin's source data is included. Audio is omitted because the source
archive does not contain real per-settlement audio files.

Open the directory through an HTTP server for local verification:

```bash
python3 -m http.server 4173 --directory github-pages
```

Create the exact deployable artifact locally with:

```bash
npm run check
npm run build
python3 -m http.server 4173 --directory dist
```
