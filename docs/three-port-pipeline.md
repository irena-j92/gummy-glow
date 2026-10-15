# Three-port pipeline material and layout

Historical material-study notes. The current maze composition is documented in `candy-maze-extraction.md`; that newer screenshot supersedes the two-loop layout below.

Reference: attached Gemini-generated clear-glass/silver pipe system. Use the glass and metal finishes; omit every valve, lever and handwheel. The temperature dial is molded plastic rather than silver.

| Port | Artwork center | Fraction | Fluid |
|---|---:|---:|---|
| Watermelon |247 /1442|17.129%|Pink|
| Blueberry |733 /1442|50.832%|Blue|
| Pumpkin |1219 /1442|84.535%|Orange|

`pipe-layout.js` shares the1440×1080 diagram, two upper paths and three lower paths with the Three.js model and static fallback generator. Both the pipeline and Newbies artwork use100% width capped at1400px. Model coordinates and the orthographic camera preserve these fractions. All external pipe terminals lie along the bottom.

The upper clear shells use physical materials with metalness0, roughness0.055, clearcoat1 and opacity0.28, plus an inner wall and a narrow reflection streak. Gaussian sprite textures provide blurred colored silhouettes without costly full-scene blur. Sprites fade out before y738 so their bounds never cross the y760 lower split. Below the silver junctions, only continuous fluid cores are rendered; a shared time uniform drives traveling light bands. The dial face has a Celsius scale and a small pointer; housing roughness0.42/metalness0 distinguishes it from metal fittings. Silver bodies and seam rings use two instanced draw calls.

Three.js remains deferred. The one context retains capped pixel ratio, visible-only frame scheduling, hidden-tab suspension, preference-based still view, resource disposal, and a matching SVG fallback after context failure. No shadows, full-screen refraction render targets, HDR downloads, valves, or external services are introduced.

Validation: finite real Three.js meshes/instance matrices, material roles,24 upper-only gummy sprites, three color-matched lower cores, six viewport alignment cases, engine pause/resume/failure/disposal, and existing site regressions. The SVG fallback was visually inspected. Actual GPU/browser material appearance and FPS cannot be verified without the supported browser surface in this managed environment.
