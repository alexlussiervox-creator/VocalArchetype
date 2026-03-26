# VoxTools

GitHub-ready React + Vite source project for a mobile-first vocal prompt builder and vocal identity engine.

## What is included
- Enriched descriptor library
- Artist profiles with Studio / Suno / Udio prompts
- 50 contemporary vocal archetypes
- Prompt builder with primary / secondary / modifier stack
- Intensity + priority controls
- Basic conflict warnings
- PWA support (manifest + service worker + install prompt)

## Local use
```bash
npm install
npm run dev
```

## Production build
```bash
npm install
npm run build
```

Deploy the `dist` folder to Netlify, or connect the repo directly to Netlify and use:
- Build command: `npm run build`
- Publish directory: `dist`
