# Phase U0 — UI audit (feat/ui-reference)

Compared current student app (post Round-3 + interim design pass) against kit references at ~390×844. Severity: **blocker** / **major** / **minor**.

## Global

| Element | Reference | Current | Severity |
|--|--|--|--|
| Logo | Tilting orbit ring `logo-mark.svg` + letter-spaced ORBIT | Glowing circle mark | major |
| Bell badge | Unread count pill | Present | ok |
| Bottom nav active | Circular tinted pill, 24px icon, 12px label | Soft glow, no pill; focus square outline | major |
| Sticky header overlap | Content clears header | Risk of underlap on hubs | major |
| Fonts | Self-hosted Plus Jakarta + Inter + Noto Telugu | Google Fonts CDN | major |
| Colour tokens | `--o-*` dark+light AA muted `#8FA0BF` | Mix of legacy + `#64748B` muted | major |
| Icons | Only via `icons.ts` | Direct lucide + letter tiles | major |
| Card hover-lift | Press scale only | Hover translateY on cards | major |

## Home

| Element | Reference | Current | Severity |
|--|--|--|--|
| Hero | Full-bleed, floating chips, hero-home art | Boxed JPEG card | blocker |
| Next class | Subject IconTile, topic, in N min, art | Letter/glyph tile, filler subtitle, duplicate eyebrow | major |
| Stats | 4 compact row tiles + gradient icons | 2×2 large plain cards | major |
| Priority | Green plant + ring OR caught-up art | Plain card / weak empty | major |
| To-do | Icon tile + tag chip + checkbox | Circle + text only | major |

## Learn

| Element | Reference | Current | Severity |
|--|--|--|--|
| Hero | hero-learn.svg | Reuses home JPEG | major |
| Continue empty | EmptyState + caught-up + quiz CTA | Plain sentence | major |
| Subjects | Horizontal 132px snap cards + subject icons | 2×2 letter avatars | major |
| Upcoming icons/dates | Item-type tile + DateChip; hide past | Flask for all; raw/plain dates | major |
| Study tools | 3-col stacked tiles | 2-col rows | minor |

## Grow

| Element | Reference | Current | Severity |
|--|--|--|--|
| Hero | hero-grow.svg | Motivation JPEG | major |
| Discover chips | Outline + / solid selected | SaChip solid/outline partial | minor |
| Explore | Horizontal 138px cards | 2×2 ok if saturated | minor |
| Recommended empty | Shared EmptyState | Mixed empty patterns | major |
| Why: reasons | Genuine match only | Keyword match mostly ok | minor |

## Me

| Element | Reference | Current | Severity |
|--|--|--|--|
| Title | "Me" + subtitle | Missing page title | major |
| Avatar | 72px initials + ring | Graduation cap / photo | major |
| Profile + quote | Stacked | Side-by-side cramped | major |
| Progress | 4-col single card; "Syllabus covered"; View all | 2×2; "Edit"; mastery-ish wording | major |
| Achievements | Hex badges earned/locked | Plain list | major |
| Interests | Chips with ICON.interest | Plain pills | major |

## Contrast / touch / hex

- Body muted `#64748B` on dark fails AA → use `--o-muted`.
- Many controls <44px height.
- Hard-coded hex widespread in student hubs.

## Resolution plan

Implement kit Phases U1–U5 on `feat/ui-reference`: copy assets/theme/primitives, self-host fonts, restyle four hubs, presentation-mapping fixes only.
