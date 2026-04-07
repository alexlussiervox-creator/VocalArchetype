# VoxTools Vite shell

Deployable React/Vite shell around the VoxTools semantic backend spine.

## What is included
- React + Vite frontend shell
- Netlify-ready build config
- Minimal PWA setup with manifest, icons, service worker, and install button
- Existing compiler backend, resolver, packaging, fixtures, and tests

## Scripts
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`
- `npm run test`

## Netlify
This repo is set up for Netlify with:
- `npm run build`
- publish directory: `dist`
- `netlify.toml` included

## Local run
```bash
npm install
npm run dev
```

## Local validation
```bash
npm run typecheck
npm run build
```

## PWA note
The install button is wired in the UI, and the project includes:
- `public/manifest.webmanifest`
- `public/sw.js`
- app icons in `public/icons`

Installability still depends on real browser conditions such as HTTPS, a valid manifest, and service worker control.
