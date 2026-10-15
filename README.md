# Gummy Glow — The Feel-Good Factory

A vitamin-gummy brand experience with a private Sites deployment, locally hosted artwork, GSAP scroll storytelling, and a Three.js glass pipeline.

## Develop and check

```sh
npm ci
npm run build
npm test
```

The build generates product pages and the pipeline's static fallback, then prepares `dist/client` and the Worker in `dist/server`. The Worker supplies page routes and `/api/subscribe`; newsletter storage requires the configured D1 binding. No payment processor or Instagram account is connected.

## Current experience

- Reception: supplied claw-machine frame, centered pouch delivery, three popcorn cycles of pink gummies, floor buttons 0–5.
- Description: centered perspective tilt, zoom and upward exit; one empty viewport of scrolling before the creation section appears.
- Creation: blueprint-to-gray-pouch scan, floating completed model, pink wall claws and an elevator arrival.
- Comparison: supplied table artwork and overlapping clipboard with hover tilt.
- Classics: enlarged, separately masked chambers; Watermelon, Blueberry and Pumpkin align with their pipe inlets, with Blueberry centered. Elderflower remains accessible horizontally. Glass dissolves on hover/focus.
- Pipeline: six bends per pipe, reflective glass, large photographic gummies visible from the inlets, and three vivid liquid-only outlets aligned with Newbies. The section stays still as it scrolls into view; its #FC8CF6 background matches Classics.
- Newbies, horizontally scrolling paper reviews with a magnifying lens, and overhead pouch packing.
- JOIN THE FUN: six supplied portrait photos on a navy rope with pink clasps, subtle tilts/folds and pink Instagram marks. Mouse drag, touch and keyboard scrolling; a larger-photo viewer with previous/next controls and focus restoration.
- Pink post-box feature and the supplied navy footer, including newsletter sign-up.

There are no wave dividers. Header, scrolling, product shopping and gallery interactions respect reduced-motion preferences. The bag is saved locally; checkout and social profiles remain preview features.

## Source layout

- `public/`: browser source, generated collection/seven product pages, artwork, fonts and vendored libraries.
- `public/pipe-layout.js`, `pipe-style.js`, `pipe-model.js`, `tour-webgl.js`: shared glass geometry, photo gummies and the lazy-loaded renderer.
- `scripts/generate-pipe-fallback.mjs`: static/reduced-motion pipeline generated from the same geometry.
- `public/description-motion.js`, `packing-motion.js`, `section-motion.js`: scroll choreography.
- `public/community-gallery.*`: hanging-photo layout and accessible full-photo viewer.
- `worker/`, `db/`, `drizzle/`: newsletter endpoint and schema.
- `docs/` and `brand-spec.md`: reference measurements, asset decisions and implementation limits.

The GitHub snapshot also mirrors `public/` at the repository root, retaining the repository's existing static-export layout. Serve that mirror at an origin root for its absolute asset paths. Static-only hosting does not run the newsletter Worker. Committing source does not change the private Sites audience or configure GitHub Pages.

## Validation and performance

`npm test` exercises actual GSAP timelines and Three.js geometry with rendering/DOM adapters. Checks cover navigation, six responsive hero geometries, one-screen description hold, six pipeline bends, chamber alignment, offscreen/hidden/reduced-motion shutdown, image-viewer controls, packing order, product routes/bag behavior, and newsletter success/failure states using in-memory storage.

The pipeline shares one lazy-loaded WebGL context, caps rendering resolution, stops rendering when not visible or under reduced motion, and releases resources on disposal. All runtime fonts, scripts, photos and 3D resources are local. Community photos load lazily; the full-size image is requested only on opening the viewer.

Live browser visual verification and GPU/frame-rate measurements are unavailable in this managed environment. Programmatic checks do not establish real-browser appearance or FPS. See `docs/glass-material-reference.md` for the glass reference's missing external maps and the WebGL material approximation.

## Hosting

`.openai/hosting.json` identifies the existing owner-private Sites project. The Sites workflow builds and deploys the exact synchronized source state while preserving owner-only access. GitHub source synchronization is performed when requested; it does not change that hosting access policy.
