# Reflective glass and clear inlets

Restored the Simple Glass reference material response used before the flat white coat: physical transmission 0.96, roughness 0.045, IOR 1.52, neutral attenuation, environment intensity 1.55; the front overlay is the earlier physical reflection layer rather than unlit white. Removed emissive fill. The static fallback approximates cylinder depth with broad soft reflection/shadow bands, not the previous narrow internal white stripe. White 80% exterior silhouettes are retained.

Removed every silver pipe coupling/seam mesh and all reservoir/cap hardware. The inlet tubes now enter directly from above the scene, with the same 0.18 outer radius as the thick main pipes, replacing the earlier narrow cartridge rods. Their centers are 550, 800 and 1050 in the 1600px composition (250px apart). Top liquid feed meshes are removed, and gummy images fade in below y=230 so the straight inlet area contains no color. Lower fluid stays vivid.

Corner radius reduced from 32px to 30px, keeping it just larger than the 28.8px pipe radius to avoid folded tube geometry; removed the short extra dogleg on the right route in favor of a longer straight run. Scene stays frameless on the page's light pink.

Section order: Classics → Pipeline → Newbies → Reviews → Packing. Floor metadata is monotonic 0…7; header buttons 4 and 5 now link to Pipeline and Newbies respectively. Review text, lens and horizontal scrolling are retained.

Validation: full automated suite, glass material and finite geometry, wide inlet positions, no couplings or top liquid, clear-inlet candy gating, floor order and anchors, review lens lifecycle, animation/product/packing/newsletter regressions; fallback rasterization and visual review. Browser/GPU appearance remains unverified in the managed environment.
