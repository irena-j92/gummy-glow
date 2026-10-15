# Clean, brighter pipeline

Removed striped sleeves, the silver spring, circular curls, and the overlapping teal recirculation loop. Three independent routes now carry pink swirl, blue-star and orange photo gummies; no teal asset is loaded by the pipeline. Each route still gets twelve evenly spaced gummies. The description's teal gummies are unchanged.

Outer radius increased from 0.135 to 0.18 (one third thicker); inner radius 0.16 and liquid radius 0.151. Silver fittings widen accordingly. Shared dimensions live in pipe-style.js and drive WebGL plus SVG. Both the dedicated offset white highlight meshes and the SVG's internal rim paths are removed. The existing white 80% outer silhouettes remain.

Replaced the dark front reflection overlay with a broad, untonemapped white translucent coat; the glass adds a small neutral emissive fill and softer reflections. Fittings use brighter silver. All three top feed curves share the exact liquid material instances, colors, opacity and clock used by the bottom outlets. Source cartridges also use the same color values without tone mapping. The page remains the light pink backdrop with no decorative scene frame.

Validation: full site regression suite; material/geometry checks, three aligned lower ports, matched top/bottom materials, image bindings, no teal, no decorative meshes or dedicated internal highlight lines, desktop/mobile lifecycle, failure cleanup, static SVG rendering and visual review. Browser/GPU appearance is not verified in this environment.
