# Gummy Glow motion and facts

The table is followed by four full-bleed, horizontally scrollable typography panels. Their Anton headlines, navy-on-pink palette and subtle swirl background reuse the visual language of the former Pick Your Glow scene; the product picker and its animation code have been removed. There are no illustrations in the facts.

Text transcribed from the supplied facts image:

- TUMMY-LOVING — Prebiotic goodness to support healthy digestion
- VITAMIN-PACKED — Essential vitamins & minerals to support everyday health
- SWEET & SMART — Fiber-rich ingredients to keep you feeling fuller
- INNER GLOW — Plant-powered antioxidants help protect cells from stress

Native horizontal scrolling, touch swipes, mouse dragging, Arrow keys and Home/End expose all four facts. The page does not intercept vertical scrolling. Existing section reveals remain reversible and respect both system and saved reduced-motion preferences.

The reception begins immediately with the original claw delivery. There is no preloader screen or loading wait. The chamber doors retain their opening motion without the dotted vertical markings.

The four gummies also alternate in the YUMMY GUMMY marquee. The marquee has a white background. Fine-pointer hover pauses the belt, while each gummy eases into an alternating left/right tilt. Reduced motion removes both the belt motion and hover rotation. Offscreen and hidden-page handling still pauses the marquee.

The jelly room extends to the viewport edges using an edited panoramic background while retaining the original central chamber image, its glass overlays and product links. This keeps all three sticks centered with the existing pipe outlets. The side image loads lazily. Classic display names move down 2px; the View All lettering is 10px shorter, retaining the pixel artwork.

The native factory-pass drawer, elevator doors, blueprint-to-gray-model creation, connected pipe assembly and product navigation remain in place. Creation continues to use a native sticky tunnel rather than competing GSAP pins. No new animation library or continuous rendering loop was added.

Validation covers the complete existing suite plus immediate reception entry, deep-link and reduced-motion behavior, facts keyboard bounds, all four marquee assets, factory-pass focus/navigation and reversible GSAP doors. Desktop browser checks cover the reception handoff, facts scrolling and chamber geometry. Compact behavior is checked by source and runtime adapters; physical mobile-device and GPU frame-rate testing are not claimed.

Panoramic asset: `public/assets/newbies-room-wide.webp`, edited with the built-in image generator from `newbies-empty-chambers.webp`. Prompt: extend only the matching pink walls, ceiling and reflective floor left and right, keeping the three empty central chambers and adding no objects or text. The original center remains the visible product stage.
