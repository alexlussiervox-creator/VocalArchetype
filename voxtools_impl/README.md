# VoxTools implementation backend spine

Repository-grade starter for the VoxTools semantic backend spine.

## What is included

- Canonical engine contracts
- Capability map
- Constraint engine
- Compiler-aware resolver
- Suno packaging layer
- End-to-end pipeline orchestration
- App adapter/state boundary files
- Regression fixtures
- Vitest test files
- A reusable mobile install button component for the app UI

## Install

```bash
npm install
```

## Typecheck

```bash
npm run typecheck
```

## Run tests

```bash
npm test
```

## GitHub import flow

1. Create an empty GitHub repository.
2. Unzip this archive locally.
3. From the project folder:

```bash
git init
git add .
git commit -m "Initial VoxTools backend spine"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## Mobile install button

A reusable install button is included at:

- `src/app/components/InstallAppButton.tsx`
- `src/app/pwa/useInstallPrompt.ts`
- `public/manifest.webmanifest`

### Important

The button only appears when the browser fires the `beforeinstallprompt` event. On Android Chrome this usually works for installable PWAs. On iOS Safari, there is no equivalent native prompt event, so users generally need to use **Share -> Add to Home Screen**.

To use the component in your real UI:

```tsx
import { InstallAppButton } from "./src/app/components/InstallAppButton";

export default function App() {
  return <InstallAppButton />;
}
```

For a full installable experience in the real VoxTools app, you still need the usual PWA plumbing in the actual frontend shell:

- valid web manifest
- icons
- HTTPS deployment
- service worker registration
- compatible browser installability checks

This repo includes the button and supporting hook so the install affordance is not forgotten or hand-waved into the void.
