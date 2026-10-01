# Orbit: image generation prompts (raster assets)

I can build vector assets (icons, badges, hero scenes, plant, logo) and those are already in `assets/`. I cannot generate photographs or a consistent illustrated character. Those come from an image model, using the prompts below. Use the same model and the same style block for every image so the set looks like one product.

Models: use whichever you have access to with **character/style reference** support (Midjourney with `--cref/--sref` or omni-reference, Google's Gemini image models, Flux Kontext, GPT image). Check current feature names, they change often. Confirm the **commercial-use terms** of your plan before shipping.

## 1. Style block (append to EVERY prompt)

```
soft 3D-illustrated look with painterly lighting, deep navy ambient background (#0A1020 to #0B1A3A), cool blue rim light with a warm amber accent light, gentle bokeh, subtle film grain, rich but not neon colours, clean readable shapes, generous empty space on the LEFT third for text overlay, no text, no letters, no logos, no watermark
```

Negative / avoid: `text, captions, watermark, logo, extra fingers, distorted hands, uncanny face, photorealistic child, brand names, cluttered background, harsh neon, oversaturated skin`

## 2. Mascot: Ananya (illustrated, NOT photoreal)

Photoreal faces of children are a privacy and trust risk for a product used by minors, and a stock photo of an adult (as on the current Me screen) is wrong for a Grade 8 student. Keep the mascot illustrated and stylised.

**Character sheet prompt (generate once, reuse as reference forever):**
```
character design sheet of Ananya, a friendly 13-year-old Indian schoolgirl, hair in a high bun, warm brown skin, large expressive eyes, navy school vest over a white shirt, small round earrings; front view, three-quarter view, and seated at a laptop; consistent proportions; neutral dark navy background; [STYLE BLOCK]
```
Save the best front view as `ananya-ref.png`. Every later prompt uses it as the character reference.

## 3. Screen hero art (transparent background, 2x, WebP)

| File | Prompt (add style block) |
|---|---|
| `hero-home.webp` | `Ananya sitting at a desk with an open laptop showing a glowing ring logo, smiling, small floating glass cards around her (book, sprout, compass, star, heart), warm desk lamp, stack of books and pencil cup at the right edge` |
| `hero-learn.webp` | `Ananya resting her chin on her hand, thoughtful and happy, beside a tall stack of four colourful books, a glowing seedling beside her, faint orbit ring behind` |
| `hero-grow.webp` | `a cosy desk scene: potted seedling growing from a stack of books, a pin board with colourful sticky notes, a mug, warm window light, no people` |
| `quote-plant.webp` | `a single glowing green seedling with soft particles, dark background, vertical composition` |

**Transparent background:** most models do not output alpha. Generate on a flat solid `#00FF00` background, add `isolated subject on a flat green screen background`, then remove with a background-removal tool and check edges on dark AND light theme. If edges halo, regenerate with a darker flat background and use a soft gradient mask in CSS instead (the HTML reference uses `mask-image` fades).

## 4. Topic images (cards, 3:2, 1200x800, then exported at 600x400 and 300x200)

Same style block. Name files by canonical topic id, not by text.

| topic id | Prompt |
|---|---|
| `photosynthesis` | `a glowing green leaf close-up with sunlight rays and tiny particles rising, deep green and navy` |
| `robotics` | `a small friendly robot on a workbench with a soldering station and warm lamp, teal eyes glow` |
| `writing` | `an open notebook with a fountain pen mid-stroke, warm lamp, dark desk` |
| `volleyball` | `a volleyball above a net at sunset, stadium silhouette, warm backlight` |
| `stage` | `a vintage microphone under a warm spotlight on an empty stage, dark curtains` |
| `tree-plantation` | `young saplings in dark soil with morning mist and sunlight shafts` |
| `space-science` | `a ringed planet and a small telescope silhouette against a violet-navy starfield` |
| `chemistry` | `glass flasks with softly glowing orange and blue liquids on a dark lab bench` |
| `maths` | `floating geometric shapes and a graph line with soft blue glow on dark navy` |
| `coding` | `a laptop with soft glowing abstract code shapes (no readable text), headphones, dark desk` |

Rules: no readable text in images, no faces unless the mascot, no brand marks, no sports teams or logos. Anything an image model gets wrong in science (labelled diagrams, equations) must be built as SVG instead.

## 5. Empty-state illustrations (96x96 SVG preferred; raster fallback 192x192 WebP)

Already provided as SVG: `caught-up.svg`. Still needed (ask the model for a flat, simple, two-colour style, or have me extend the SVG set):
- `no-competitions` (small trophy with orbit ring, dim)
- `no-achievements` (locked hex badge outline)
- `no-interests` (compass with sparkle)
- `offline` (cloud with ring, calm)
- `error` (ring with a soft question mark, never red or alarming)

## 6. Technical spec

- Format: WebP (quality 80) with PNG fallback only if needed; SVG for art that is already vector.
- Sizes: heroes 520x340 @2x; topic cards 600x400 and 300x200; thumbnails 96x96.
- Store under `public/art/` (hero) and `public/art/topics/<topic-id>.webp`; map in a `topic_assets` table (see the asset pipeline notes), with the gradient + icon-tile as the fallback so nothing renders broken.
- Never generate images at request time. Pre-generate, review, CDN-cache.
- Add `width`/`height` attributes and `loading="lazy"` below the fold.

## 7. QA checklist per image

- [ ] No text, logos or watermarks anywhere
- [ ] Hands, eyes and faces are clean at 2x zoom
- [ ] Mascot matches the character sheet (hair, vest, colours)
- [ ] Left third is calm enough for overlaid text, contrast >= 4.5:1 for white text
- [ ] Looks right on dark AND light theme (edges, halos)
- [ ] Culturally appropriate for the school's region; no real person's likeness
- [ ] File size under 120 KB (hero) / 60 KB (card)
- [ ] Licence/terms of the generator allow commercial use; keep generation prompts and model name in `docs/ui/ASSET_LOG.md`
