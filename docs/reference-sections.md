# Gummy Glow reference extraction — 13 October 2026

Three high-resolution desktop section exports: comparison 1545×2048, reviews 2048×1786, pipeline 1440×1220. Existing hero, description and chamber are retained. Current order is reception, description, gray chamber, comparison, Classics, reviews, pipeline, Newbies, packing and footer.

| Layer | Comparison | Reviews | Pipeline |
|---|---|---|---|
| Layout | Centered two-line headline; single portrait clipboard overlapping headline, rotated about 6° | Horizontal oversized note track; first card clockwise, second counterclockwise and lower | Three overlapping tube paths: rear clear U, front clear C, solid upside-down U |
| Typography | Navy condensed heavy display, uppercase; bold geometric table labels | Navy condensed two-line display heading; geometric semibold quote; bold name and regular city | Minimal visible controls beneath visual |
| Colors | White #FFFFFF, paper #EBEBEB, navy #080F82, pink #FC8CF6 | Pink #FFD8FD, paper #FEFEFE, navy #080F82 | Pink #F9DAFB, warm clear glass, reflective gray metal |
| Spacing | Heading about 90% width; clipboard about 70%; paper content inset10.5% | Card padding about12%; track gap about8%; staggered vertical positions | Model fills frame, pipes enter/exit edges |
| Components | Rounded 3-column semantic table; center column filled navy, pink badge checkmarks, navy crosses | White notched papers, vertical navy tape, circular reviewer marker; manual slider controls | Actual 3D curved tubes, supplied gummy sprites, subtle inner liquid shader |
| Atmosphere | Brushed chrome, white sheet, blush backing and real metal clips | Flat pink background and clean paper, no extra grain/glow | Glass highlights, chrome collars, small visible liquid modulation |
| Motion | Gentle GSAP arrival only; rows remain readable | Native horizontal swipe/scroll, keyboard and arrow navigation | Gummies follow clear tube paths; liquid moves quietly under near-opaque solid surface; pause/reduced-motion/hidden-tab support |

Condensed display uses existing Anton, geometric text uses existing Outfit. These are the closest already-loaded faces; exact source font identity is not available from the exports. Mobile uses smaller table type and a nearly level clipboard; reviews show one large swipeable card; pipeline preserves its composition through an orthographic local viewport. Browser visual diff is unavailable in the managed environment; programmatic layout/interaction/geometry checks do not establish pixel-perfect fidelity or FPS.

## Packing motion sheet

The supplied animation.png provides the blue rollers; gummy-bpx.png provides the pink crate filled with all four pouch colors. New isolated empty crate and roller assets keep the pouches as independently animated DOM layers.

| Phase | Start | Duration | Result |
|---|---:|---:|---|
| Container arrival | 0s | 1.25s | Hidden offscreen right to stationary center |
| Hold | 1.25s | 0.45s | No pouch visible yet |
| Pouch drops | 1.7s | 1.1s each, 0.19s apart | Scale2.2 and blur14px to normal scale/sharp |
| Landing settle | Each impact | 0.26s | Small vertical recoil settles behind crate front |
| Completed crate | 5.2s | Indefinite | Twelve pouches remain visible; no automatic repeat |

Replay starts the same sequence. Offscreen and hidden tab states pause it. Reduced motion shows the fully packed static result. Motion uses the existing GSAP power2 family; native page scrolling is not pinned or intercepted. Browser frame-rate measurement remains unavailable.

## Crystal pipeline — updated prompt

The latest user prompt supersedes the milky-shell / blurred-color direction. Keep the three measured looping routes and pastel background. Use bright clear glass edges, pale liquid, recognizable 3D orange triangles / blue stars / purple swirls, and tiny drifting bubbles. The intersecting white arch is opaque and matte; its material diffuses a localized pink flow at the crossing. No collars return. Three candy instanced batches and one bubble batch avoid per-piece draw calls. Arc-length samples are cached before animation; all layers use the same controllable clock. Preserve the local orthographic viewport, capped DPR, lazy scene construction, pause / sample buttons, offscreen / hidden suspension and reduced-motion fallback. No new post-processing or transmission render pass.
