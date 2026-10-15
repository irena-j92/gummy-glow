# Description motion extraction — 14 October 2026

The four supplied 2048px-wide frames show a legible oversized text block, an enlarged / horizontally tilted perspective view, a faint upward text exit, then an empty field. Six gummies occupy separate depths: a large blurred left edge, large blurred right edge, large bottom-left star, bottom-right swirl, small center-left star, small center-right swirl. Foreground pieces move upward faster and leave last.

Keep Gummy Glow's navy / pink palette, original paragraph, and existing four gummy types. Use a cinematic scroll sequence with a short readable hold, perspective lean / growth, then upward dissolution. Native scrolling controls a sticky viewport; there is no wheel interception or timed waiting. GSAP uses the existing power2 family with one scrubbed timeline. The text remains real selectable / accessible HTML. Six existing optimized images are reused; static blur establishes depth while transform / opacity alone animate.

| Scroll portion | Text | Gummies |
|---|---|---|
| 0–18% | Original size, flat and fully opaque | Reference-like six-position composition |
| 18–68% | Grow to1.7, lean32° around horizontal axis and9° sideways, rise28% of viewport, fade to55% | Large edge pieces rise quickly; small center pieces move more slowly |
| 68–96% | Grow to2.12, lean44°, rise93% of viewport, fade fully | All pieces continue upward and leave the scene |
| 96–100% | Hidden | Hidden, ready to enter the chamber below |

Scrolling backward restores the exact earlier pose. Responsive text sizing uses both viewport width and height. Reduced motion / unavailable GSAP shows the entire original paragraph as a normal static section, with no expanded scroll range. Browser visual / FPS checks are unavailable in the managed environment; actual GSAP timeline targets, stage layout contracts, accessibility, lifecycle and production build are checked programmatically.

Current timing: 400svh section, 300svh native sticky travel. The original entrance/perspective/exit retains its scroll distance. After all content clears at timeline time0.98, hold for0.59, then fade the stage from1.57 to1.77. The empty hold is exactly100svh (0.59/1.77×300svh). Reduced motion remains a normal static paragraph.
