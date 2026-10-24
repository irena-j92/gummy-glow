# Gummy Glow — 21 October 2026

The existing owner-private Site receives these changes. GitHub sharing is unchanged.

- Three separate stick products sit inside the supplied empty chamber scene. White glass overlays use exactly 15% opacity. GSAP reveals each package from bottom to top while a bright wand tip follows four horizontal orbits along the reveal edge. Scrolling backward reverses the scan. Reduced motion shows complete products immediately.
- Pipe outlets now use the measured chamber centers: 260, 640 and 1020 in a 1280-pixel scene. Classics → pipes → Newbies remain one connected assembly.
- A looping YUMMY GUMMY marquee and four horizontally scrollable facts sit between creation and the comparison table. Facts preserve the supplied wording. The marquee pauses offscreen, in hidden tabs, on hover, and under reduced motion.
- Classics have four editable HTML flavor names in a locally generated pixel font. The corresponding raster displays are blank, so labels appear once.
- Creation's exterior corners are transparent. Internal display panels and studio lights remain white.
- The photo line uses a code-native pink binder-clip illustration. Sparkle marks were present on three of six photos; those three were edited at both full and thumbnail resolutions. All six existing Instagram icons remain.

## Asset paths and built-in image-edit prompts

Built-in image generation was used for these raster edits. Outputs are integrated in `public/assets/`; original source files remain in the repository.

`public/assets/lab-chamber-isolated.webp`

> Use case: background-extraction. Edit target: attached pink creation chamber. Remove ONLY the external white corner pixels outside the rounded chamber silhouette, producing true transparent alpha outside the chamber. Keep the chamber in exactly the same full-canvas framing and aspect ratio, same pink metal/glass structure and all internal white lighting and white header display, do NOT make the internal display or lights transparent. No cropping, no new objects, preserve interior geometry.

`public/assets/classics-chambers-blank.webp`

> Use case: precise-object-edit. Edit target: four pink factory cabinets. Remove ONLY the blue flavor names from ALL FOUR header displays and reconstruct their clean pale pink-white illuminated surfaces. Keep exact 2048:849 panoramic layout, four cabinets same size and position, absolutely all framing, glass, highlights and empty chambers unchanged. All four displays must be entirely blank. No new lettering, products or objects.

`public/assets/community/pumpkin-smile-clean.webp`, `blue-star-clean.webp`, `teal-smile-clean.webp`, and their `-600` thumbnail variants:

> Use case: precise-object-edit. Remove ONLY the small white four-point sparkle logo at the bottom-right corner, seamlessly restoring the underlying fabric/skin/background. Preserve the same person and identity, face, fingers, clothing pattern, gummy and packaging text, exact composition, full portrait aspect ratio and all image content everywhere else. No crop, no new elements.

`public/assets/newbies-empty-chambers.webp` is the supplied chamber reference, optimized for the web. Packaging uses the existing three stick images. `pink-binder-clip.svg` is a new vector illustration based on the reference; `glow-pixel.woff` is a locally generated bitmap-style font, with its source in `scripts/generate-pixel-font.py`.

## Validation

The automated suite covers actual GSAP reveal progression, orbiting movement, stagger, reversal, cleanup, reduced motion, facts keyboard bounds, marquee offscreen/hidden behavior, outlet alignment, product routes, gallery interactions, and existing tour behavior. Image assets were visually inspected. Live browser QA was unavailable because the cloud browser could not access the local preview under its environment policy.
