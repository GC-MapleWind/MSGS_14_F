# Kangmin GitHub Pages

This directory is an independent static implementation of the original
`MSGS_13_F` user flow. It does not modify or depend on the local Svelte mockup
served at `localhost:5173`.

- Home: a single Kangmin character card
- Member: Kangmin profile and all 12 real settlement records
- Detail: one complete settlement view for every record
- Save: a downloadable Kangmin character card
- Routing: browser history plus a GitHub Pages deep-link fallback
- Audio: omitted because the source archive contains no real audio files

Open the directory through an HTTP server for local verification:

```bash
python3 -m http.server 4173 --directory github-pages
```
