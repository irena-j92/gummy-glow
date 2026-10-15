# Classics chamber wall — extraction and implementation

Inputs: attached `chambers.png` (2048×849 RGBA) and `display.png` (2048×173 RGBA). These are glossy factory artwork exports, not a full-page layout. Preserve both native proportions and the four baked-in navy pixel labels. The source wall contains Watermelon, Elderflower, Pumpkin and Blueberry. The displayed order is Watermelon, Blueberry, Pumpkin, Elderflower; stable data-cabinet indices 0/3/2/1 keep each original title matched to its pouch. The empty black display is centered horizontally between x≈773 and1275 (37.75%–62.25%), y≈40–140 (23%–81%).

| Layer | Measurements and decisions |
|---|---|
| Grid | Four equal 512px cabinet crops, independently masked. Desktop uses the same min(100vw,1400px) canvas as the pipeline. Each cabinet is 30% wide, with 2.5% gutters and 2.5% outer margins. Initial centers are 17.5%, 50%, 82.5%, matching the three pipe inlets exactly. Blueberry is in the middle, while Elderflower is reached with one horizontal column scroll. Mobile retains 96vw viewport and 1.25 visible chambers with 12px gaps to keep labels usable. |
| Type | Preserve native chamber title pixels. Add only VIEW ALL in the black display; local pixel-shaped SVG lettering keeps the factory aesthetic without an external font. Screen-readable link text remains live HTML. |
| Color | Existing magenta chrome and navy labels remain in the supplied image; requested glass tint is #FFE4FF at20% opacity. Display lettering uses #FFE4FF. Section retains #FC8CF6. |
| Spacing | The display attaches flush beneath the visible wall viewport and stays available as the chambers scroll. Its desktop2048:173 aspect is preserved; mobile crops only the chrome ends to keep the center screen and44px target readable. No duplicate CTA below. |
| Components | Four product links behind four independent glass rectangles; glass x≈7%, y≈14%, width≈86%, height≈75% within each chamber, softly rounded to follow the aperture. Display is one large keyboard-accessible collection link. |
| Atmosphere | Preserve photographic chrome/reflections. Render each cabinet through its own SVG outline mask to remove the pale exterior corners without repainting labels or modifying original image pixels. |
| Interaction | Three larger chambers are visible on desktop, aligned to the pink, blue and orange pipe inlets; mobile shows1.25 to keep product names and targets readable. Native horizontal touch/trackpad scroll, mouse drag and left/right keyboard steps including each gutter. No wheel interception. Glass fades on fine-pointer hover and keyboard focus; reduced motion makes that change immediate. All four original pouch drops remain simultaneous. |

The review paper's top-left bevel is replaced by a complete rounded corner, keeping both side notches and fiber texture. A48px minimum desktop/32px mobile scroll gutter prevents rotated paper edges from hitting the scrollport.

Browser visual diff is unavailable in this managed environment. Verify asset dimensions, masks and control/scroll contracts programmatically; disclose that limitation on delivery.
