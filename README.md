# Gummy Glow

A standalone, responsive brand site. Production files live in `dist/`. No build step is required. All fonts, images, GSAP, and ScrollTrigger are served locally.

## Structure
- `dist/index.html`: factory entry, claw hero, narrative, classics, blueprint, footer.
- `dist/collection/index.html`: all four supplied flavors.
- `dist/styles.css`: shared design tokens and mobile/reduced-motion layouts.
- `dist/motion.js`: independent entry, hero, gallery, and blueprint scene functions.
- `dist/assets/`: original supplied product artwork and matching generated scene assets.

## Animation direction
- Entry: image-load progress, pixel fill, factory zoom, hinged front doors, glass slide.
- Hero: 1.8s descent, 0.3s grab, 1.7s lift, staggered gummy launches, 1.35s claw exit, then final gravity-like fall. Replay is available after completion.
- Classics: pinned horizontal translation above 600px, natural vertical display on mobile. Pack landing uses GSAP bounce and a fading steam layer.
- Blueprint: four facts fade before the mint and blue packages enter sequentially from opposite sides.

GSAP animates transforms and opacity; the small sprite count makes a WebGL renderer unnecessary. For a future interactive simulation with hundreds of bouncing candies, use a canvas/WebGL particle pool with fixed-step gravity and bounds collision, retaining DOM text and controls for accessibility.

Reduced motion follows the system preference and can be toggled in the navigation. The page remains readable if animation scripts fail. Entrance can be skipped by its button or Escape. Flavor copy is creative concept copy; no checkout or live commerce service is connected.

## Extension
Append new semantic sections below the blueprint. Keep each new animation in its own function/context and clean up ScrollTriggers when changing motion preferences. Preserve anchor IDs for navigation.

## Validation
JavaScript syntax and local asset/link targets checked. Browser-based visual QA was not available in the execution environment.

## Expansion (September 2026)
The authoring directory is now `public/`. The original factory scenes and footer are retained. `expansion.css` and `expansion.js` add the flavor comparison, pipeline poster, two horizontal lab reports, Newbies monitors, manual three-slide carousel, arcade previews, and newsletter.

- Loader: Enter the factory plays the door sequence; Explore flavors opens the collection; Skip intro and Escape remain available. The loader waits for the visitor after assets load.
- Gummies: four supplied transparent PNGs replace the old hue-rotated hero sprite. Those same files appear in the comparison, reviews, features, and arcade screens.
- Table: provisional flavor table; no separate table reference was attached. No unprovided nutrient quantities or product claims were added.
- Newbies: supplied three-chamber reference is used intact, with accessible HTML monitor links below. Collection links lead to the existing matching flavor pages; stick-specific product details await content.
- Reviews: two supplied concept testimonials and the requested 124-review heading. Not connected to a review provider.
- Pipeline: `public/assets/pipeline.webp` is the static video poster. Add a `<source>` to `.pipeline-media` and update the coming-soon caption when the film is ready; respect reduced motion for playback.
- Arcade: four keyboard-accessible game preview dialogs; games are intentionally not implemented yet.
- Newsletter: server validates email and explicit consent, normalizes/deduplicates addresses and persists them in D1 `newsletter_subscribers`. No email campaign service or welcome emails are connected. No public subscriber-list endpoint exists.

## Build and storage
`npm install`, `npm run db:generate` (only after schema changes), `npm run build`. The small Worker adds `/api/subscribe` without replacing the plain HTML frontend. `scripts/build.mjs` emits `dist/client`, `dist/server`, hosting metadata, and Drizzle migrations. D1 is logically bound as `DB`.

Backend checks: `node scripts/check-subscribe.mjs` after building. Tests use an in-memory SQLite database, not production subscriber records. Assets and footer preservation checked separately. Live visual browser QA was unavailable in this environment; desktop/mobile rules and interactive DOM state were checked locally.

## New scene assets
Pipeline and mailbox were generated with built-in imagegen and converted to WebP for this site. Pipeline brief: glossy 16:9 pink factory, transparent glass pneumatic tubes and four distinct gummy shapes. Mailbox brief: reference-matched pink open postbox overflowing with supplied Gummy Glow packs, right-aligned against a pastel sky with calm left space for the form.

## Hero + Classics alignment update (September 29, 2026)
- `factory-scenes.css` changes only the requested scenes. Hero base gradient is exactly `#080F82` to `#8B8DB0`; supplied `hero-pattern.png` is a subtle overlay masked out at the gradient endpoints.
- Supplied `claw.png` retains its original transparent canvas. `scene-math.js` measures the visible prong tips against the pouch seal and centers the visible pouch bounds. Hero pouch and claw are now independent DOM layers.
- Hero timing: descend 1.8s to image-top y=0; immediately lift for 1.7s; pouch stops at hero center at 3.5s; after 0.18s release pause, claw exits over 1.35s. Existing popcorn trajectories and staggering use only the pink sprite. Replay resets the complete sequence. Resizing resolves the scene to a stable centered pouch.
- Classics supersedes the original pinned horizontal gallery: four contiguous full-height frames (four columns desktop, two-by-two on mobile), titles inside the existing image header panels, and all pouches dropping on one ScrollTrigger. The 0.8s first impact starts all pressure rings, flashes, and steam plumes together; recoil settles afterward.
- Geometry assertions: `node scripts/check-scenes.mjs`. Validated visible pouch centering, prong overlap during lift, entry/exit bounds across six viewport sizes, four flavor windows, and pink-only hero sprites. Other sections and footer were checked for unchanged markup. Live browser visual verification remains unavailable.

## Minimal hero refinement (September 30, 2026)
The hero now contains only `VITAMMHMMMS` and animated artwork. Pouch visibility starts at zero in CSS and initialization, and is enabled only at pickup. Claw and pouch are enlarged together by 45%, subject to a mobile-width cap that keeps the visible grip inside the screen. Each pink gummy performs exactly three consecutive rise/fall cycles, then stays offscreen. The supplied swirl is an explicit image layer above the gradient, rendered in pale contrast so it remains visible. The navbar motion control has been removed; system reduced-motion preference is still respected. The navbar logo uses a top anchor (also from the collection page), and the factory intro is shown only once per tab session. Resize handling preserves an in-progress animation instead of prematurely revealing the pouch.

## Blueprint materialization (September 30, 2026)
Hero desktop sizes are now 770px for the complete claw image canvas and 560px tall for the undistorted pouch (about 347px wide, close to the requested 360px). Small viewports proportionally reduce both. The existing hidden-until-pickup behavior remains intact.

The blueprint scene now uses the supplied `blueprint.svg` and `pouch-packaging.png`. `blueprint-reveal.css` aligns the SVG to the photograph's visible bounds inside a shared 640×1085 artboard. Complementary CSS masks reveal the realistic pouch from top to bottom while removing the underlying drawing at the same soft boundary. The feather spans 5% of the displayed height, leaving the completed artwork sharp. One fact on each side fades in and remains present. A single pinned scrub timeline replaces the earlier fade-out / sliding-package sequence, including on mobile. System reduced-motion displays the completed pouch and both facts without pinning.

Verified scene dimensions, centered grip math, original SVG preservation, two-fact structure, mask direction, and existing hero lifecycle. Live browser visual testing remains unavailable.

### September 30 — section flow and claw-machine entrance
- Page order: Hero, description, blueprint, flavor table, Classics, reviews, pipeline, Newbies, features, arcade, newsletter, original footer. Blueprint pin is registered before the following scroll scenes.
- Description uses all four supplied gummy types, scattered around the text with smaller mobile positions.
- Hero pouch holds its grip through the lift, then rotates clockwise 12 degrees around its visible center after release. It remains centered and retains the three-cycle pink-only popcorn sequence.
- Intro uses a transparent-background edit of the supplied blue claw-machine image. Removed progress bar, automatic loading progression, extra entry/skip controls, and old door transition markup. The Enter button starts a 1.25-second zoom with blur and an overlapping .75-second dissolve. Session bypass and logo-to-top behavior remain; session completion is recorded after entry. Reduced-motion visitors also enter by button, without zoom/blur.
- Validation: viewport geometry/centering and grip checks, DOM entry timeline and section-order checks, existing carousel/review/dialog controls, asset paths, unchanged footer, and production build. Browser visual QA was unavailable.
