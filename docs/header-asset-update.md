# Supplied asset extraction — 13 October 2026

| Asset | Measurements / treatment | Behavior |
|---|---|---|
| Claw machine frame | 2048×1706; retain native 1.2005 aspect; use the same 72%-height pouch proportion on mobile and desktop rather than shrinking the mobile pouch twice, clear window x≈11.6–88.7%, y≈15.5–91.6%; remove leftover fixed rod/coil from upper rim | Animated claw / pouch / title / gummies remain clipped inside the rectangular aperture |
| Buttons | 2048×305; six photographic buttons, navy base, pink circular rims and condensed numerals | Crop individual supplied buttons; keep supplied 0–5 destinations; remove 6–8; active circular glow; horizontally scrollable on small screens |
| Pouch model | 833×1223; isolated gray tilted pouch, preserve original tones and tilt | Existing soft top-to-bottom blueprint scan becomes this exact image, no extra 3D deformation; original SVG blueprint aligned with an affine fit to the four pouch corners |
| Chamber removal | 94×490 isolated glossy left-side post | Remove thick interior post while preserving surrounding frame and LED lighting; tint moving wall claws matching pink |
| Table | 756×896 SVG with outlined text, navy central column and pink badge checks | Render supplied vector at full fidelity, retain offscreen semantic table for accessibility |
| Reviews | Two and a half notes fit the desktop viewport; 18px gaps, restrained 2° tilt, smaller paper / type | Native horizontal scroll on narrow screens, keyboard / swipe; no arrow buttons, counter or scrollbar |

Hero gummies begin hidden below the aperture. Each individual gummy is revealed only at its staggered first launch, returns below the aperture for each fall, performs three rise/fall cycles, then is hidden permanently. There is no initial visible row. Pipeline reverts to the previous milky-glass scene with blurred colored gummies and stronger rose liquid.

The two newly added review notes (Alex / Mia) use draft copy; Sarah / Emily retain the user-supplied text. Browser visual / FPS verification is unavailable; geometry, assets, animation tracks, controller and scene lifecycle are checked programmatically.

## Follow-up staging revision

The supplied machine frame is now a full-width intrinsic-height image, with no viewport-height fit constraint. The six-button bank remains below it. The creation scene uses one DOM mask rather than a second WebGL rendering of the image:20% blueprint hold,70% soft downward scan,10% fully gray hold, followed by a gentle ±10px GSAP float only while the chamber is visible. Reversing before completion returns the float to its initial position.

Packing uses animation.png's overhead shallow pink tray / blue roller composition. A new transparent top-view tray replaces the front-facing lattice crate. Twelve independently layered pouches start large / blurred above the tray, descend toward the conveyor plane, sharpen and settle into an overlapping top-view arrangement. Rotated bounds remain inside the measured flat interior (x11.39–88.74%, y16.02–83.5%). Native scrolling remains free, and replay / reduced-motion / offscreen pauses remain supported.
