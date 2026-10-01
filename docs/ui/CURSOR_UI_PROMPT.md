# Orbit Student: UI build prompt for Cursor

## How to use

1. Branch: `git checkout -b feat/ui-reference`. Never push to `main`. One PR per phase.
2. Copy the kit into the repo (Cursor does this in Phase U1, or do it yourself):
   - `orbit-ui-kit/assets/**` -> `public/art/**`
   - `orbit-ui-kit/orbit-theme.css` -> `src/styles/orbit-theme.css`
   - `orbit-ui-kit/src/*` -> `src/shared/ui/orbit/*`
   - Put the reference screenshots in `docs/ui/reference/` (home.png, learn.png, grow.png, me.png).
3. The **live reference** is the published HTML prototype (open it on a phone-sized viewport, switch tabs, toggle the sun icon for light theme). Save a copy as `docs/ui/orbit-ui-reference.html`. When the screenshots and this prompt disagree, the HTML wins, because it is measured and tested.
4. Paste everything between START and END as the first message. Cursor does **Phase U0 only**, then stops. Send `Proceed to Phase U1.` etc. One phase per chat.

===== START =====

# Role

You are a senior product designer-engineer. Bring the Orbit **student app** UI to the reference design in `docs/ui/orbit-ui-reference.html` and `docs/ui/reference/*.png`, without breaking behaviour. The architecture and security rules from earlier work still apply (`.cursor/rules/orbit-architecture.mdc`, `.cursor/rules/orbit-student-ia.mdc`). Do not weaken them.

# Scope rules

- **UI layer only.** No changes to stores, repositories, Supabase, RPCs, auth, nav logic or AI code. The only non-visual edits allowed are the "presentation-mapping fixes" listed below, and each must be reported separately.
- Keep exactly 4 tabs. Keep Ask Orbit as a sheet. Keep the IA rule that depth lives under Subject, not on the Learn root.
- No new runtime dependencies except: `@fontsource-variable/plus-jakarta-sans`, `@fontsource-variable/inter`, `@fontsource/noto-sans-telugu` (self-hosted fonts). Justify anything else.
- Tailwind is **v4** (`@import "tailwindcss"`). Do **not** add `tailwind.config.js`, `@tailwind base/components/utilities`, or `@apply` chains from the Gemini token pack. If any of those were already added, convert them to `src/styles/orbit-theme.css` (v4 `@theme`) and delete the v3 files. Reason: v3 config is ignored by v4 and silently produces unstyled classes.
- Both **dark and light** themes must work (`html[data-theme]`). Every colour comes from `--o-*` tokens. No hard-coded hex in components, except inside `IconTile` gradients and `AchievementBadge` colours, which are catalogue data.
- Icons: only through `src/shared/ui/orbit/icons.ts` (lucide-react, stroke 1.75). No letter avatars ("Sc", "Ch"), no emoji as icons.
- No hover-lift on cards. Press feedback is `active:scale-[0.98]` only. (Hover transforms stick on touch devices.)
- Motion: progress bars/rings animate from 0 once on mount; tab content fades in; nothing else moves. Everything respects `prefers-reduced-motion`.
- Touch targets at least 44px. Every interactive element has a visible `:focus-visible` ring. Never show a focus ring on mouse/touch click (the current bottom-nav shows a square outline after tapping; fix this).
- Text must meet WCAG AA: do not use `#64748B` for body-size text on dark surfaces (about 3.7:1). Use `--o-muted` (`#8FA0BF`).

# Phase U0: Audit (NO code changes except `docs/ui/AUDIT.md`)

Compare the current app against the references, at 390x844 and 360x740, dark and light. Deliver `docs/ui/AUDIT.md` with, per screen, a table: element, reference, current, severity. Use these **already-known gaps** as the starting list and verify each:

**Global**
1. Logo is a glowing circle; reference is the tilted orbit ring (`public/art/logo-mark.svg`) plus letter-spaced wordmark.
2. Bell badge (unread count) is missing.
3. Bottom nav: active tab shows a blocky square outline instead of the circular tinted pill; labels and icon sizes should be 12px and 24px.
4. Sticky header overlaps the first card on Learn/Home (content is cut under the bar). Add correct top padding / `scroll-padding-top`.
5. Fonts: reference uses Plus Jakarta Sans (display) and Inter (body). App uses Space Grotesk and loads Google Fonts at runtime. Self-host; keep Noto Sans Telugu fallback.
6. Duplicate labels: "NEXT CLASS" appears as a section label AND inside the card.

**Home**
7. Hero is a boxed bordered card; reference is full-bleed (no box), small "Good morning", large name with wave, subtitle capped to ~190px, art bleeding off the right edge with floating chips (Learn Today / Grow Explore / Be You).
8. Next-class card: letter tile "Sc" instead of subject icon tile; subtitle "Ready when you are" is filler (show topic, or hide); missing "in N min"; right side empty (reference has book-stack art, faded).
9. Stats are 2x2 large plain tiles; reference is 4 compact tiles in a row with saturated gradient icon tiles (Homework, Classes, Assessment, Day streak with trophy).
10. Priority card: plain one-line box when nothing is urgent. Needs the designed "caught up" state (art + CTA). When something is urgent: green gradient card with plant art, target tile, progress ring (n/total), meta lines, Continue button.
11. To-do rows have no item-type icon tile; reference has tile + title + subtitle + tag chip (CLASS blue, HOMEWORK green, STUDY purple), circular checkbox on the left.

**Learn**
12. Hero reuses Home art and is cropped. Use `hero-learn.svg`.
13. Continue card empty state is a plain line. Needs `EmptyState` with `caught-up.svg` and a "Try a quiz" CTA. With data: plant art, ring or bar, `~N min`, due label.
14. Subjects are a 2x2 grid with letter avatars and "Start exploring" with empty bars. Reference: a horizontal snap-scroll row of 132px gradient cards, subject icon tile, name, "NN% covered", 4px bar, round arrow button.
15. **Data presentation bug:** "Chemistry Lab" and "Chemistry" both appear as subjects; Upcoming shows the same flask icon for classes and assessments; assessment date shows raw ISO `2026-08-11` (and is in the past). See mapping fixes.
16. Upcoming rows need date chips (weekday over day+month), not plain text.
17. Study tools: reference is a 3-column grid of stacked tiles (icon on top). Current 2-col rows are acceptable, but icons must sit in saturated gradient tiles.

**Grow**
18. Hero is an empty starfield box; reference has the desk/pin-board art (`hero-grow.svg`).
19. "Discover" chips are unstyled; selected chips are solid primary blue, unselected are outlined with a plus. "Not now" is too faint.
20. Explore areas: reference is a horizontal row of 138px gradient cards with saturated tiles; current 2x2 is acceptable if tiles are saturated.
21. Recommended and Upcoming opportunities empty states are inconsistent (dashed box vs bare text). Use one `EmptyState`. With data: 268px cards with image header, tag chip (SKILL/CLUB), title, one-line reason ("Why: you picked Robotics"), meta row, round arrow.
22. **Honesty bug (from earlier screenshot):** a Spell Bee championship was explained as "matches your interest in Space science". Reasons must come from a real category/title match, and past-dated items must not be recommended.

**Me**
23. Missing page title "Me" and subtitle.
24. Avatar is a graduation-cap icon; reference is a 72px initials avatar with a gradient ring (photo upload later). Do not use stock photos of real people.
25. Profile and quote cards are side by side and cramped; reference stacks them: profile card, then quote card with plant art.
26. Profile lacks school name and chips (streak, XP). Add school name.
27. "My progress" shows "Edit" (should be "View all"); reference is a single card with 4 columns (icon tile, number, label), first column has a 4px bar. Progress label "Overall progress" must say what it measures (syllabus covered), never imply mastery.
28. Achievements and Interests are plain sentences. Reference: horizontal row of hex badges (earned = colour, unearned = locked and dimmed with the hint text) and interest chips with a coloured icon.

Also report: any text below 12px, any contrast failure, any element under 44px, any raw hex in components.
Stop after the audit.

# Phase U1: Foundations (no screen redesign yet)

1. Copy assets to `public/art/` (hero-home, hero-learn, hero-grow, plant, caught-up, logo-mark, app-icon, badges/*) and the reference components into `src/shared/ui/orbit/`.
2. Add `src/styles/orbit-theme.css`; import it right after `@import "tailwindcss";` in `src/index.css`. Keep legacy tokens until no code references them; then remove them in U6.
3. Self-host the three font packages; remove the Google Fonts `<link>` tags from `index.html`; set `--font-display`/`--font-body`. Verify Telugu renders (line-height 1.5 for Telugu strings) and update the CSP for fonts (now `'self'` only).
4. Build/finish primitives in `src/shared/ui/orbit/`, each with a Vitest + Testing Library test and rendered in an internal `/dev/ui` gallery route behind the dev flag (light and dark side by side):
   `AppHeader` (logo-mark, wordmark, bell with count badge, theme toggle, sign out; 44px buttons), `BottomNav` (circular tinted active pill, `aria-current`, focus-visible only), `SectionHeader`, `IconTile`, `TagChip`, `DateChip`, `StatTile`, `ProgressRing`, `ProgressBar` (4/6px), `AchievementBadge`, `HeroBanner` (full-bleed, art right, `aria-hidden`, fade mask), `EmptyState`, `Skeleton`, `FloatingChip`.
5. Make `SaCard/SaSection/SaRow/SaChip/SaPrimaryButton` thin wrappers over the new primitives so existing screens inherit the new look without touching every call site.
6. Add `formatDate`/`DateChip` utilities (locale `en-IN`/`te-IN`, timezone `Asia/Kolkata`). Raw ISO strings must never reach the UI.
7. Add Playwright visual-snapshot tests for the `/dev/ui` gallery (dark and light). Commit baselines.
Exit: `npm run check` green; gallery matches the reference primitives visually (attach screenshots).

# Phase U2: Home

Build to the reference (HTML tab "Home"). Layout (390px; 20px side padding; 24px between sections):
- `AppHeader`, then `HeroBanner`: "Good morning" 14px muted; name 34px/800 with a wave emoji (content, not an icon); subtitle 14px, max 190px; `hero-home.svg` right, bleeding 30px off-screen, with 3 floating chips (rotated -7/+6/+5 degrees): Learn/Today (book), Grow/Explore (sprout), Be/You (sparkles). Use the existing character illustration if it exists with a transparent background; otherwise the SVG. Never a boxed JPEG.
- **Next class card** (hide the entire section if none today; show the caught-up banner instead of an empty card): eyebrow "NEXT CLASS" once, `TagChip CLASS` top-right, 52px `IconTile` (subject icon or pi glyph), subject 20px/700, topic 13px muted, meta: time + "in N min" (live-updating at minute granularity) and mode/room, primary button "Get ready" (opens Ask Orbit with seed), faded `hero-learn` art bottom-right.
- **Stats row**: 4 `StatTile`s in a row (30px gradient tile, number 21px/800 tabular, 2-line label 10.5px). Order: Homework to complete, Classes today, Assessment upcoming, Day streak (trophy, purple).
- **Your priority**: urgent state = green gradient card, plant art at 55% width masked, 46px target tile, title 19px, `ProgressRing` n/total, meta list (questions, due, teacher), primary Continue. Nothing urgent = designed caught-up banner: `caught-up.svg`, "You're all caught up!", one calm line, button "Try a quiz".
- **Today's to-do**: card with rows (60px min height): circular 26px checkbox (completed = green fill + strike-through title), 34px `IconTile` by item type (`ICON.item`), title, subtitle, `TagChip` (CLASS blue / HOMEWORK green / STUDY purple). Header shows "View all (n)" with the real open count.
- Remove the Home announcement card if present (bell only).
Behaviour must be identical (same data hooks, same handlers).

# Phase U3: Learn

- `HeroBanner` "Learn" + `hero-learn.svg`, tilted note "Learn / Understand / Practice / Improve".
- **Continue card**: 52px green sprout tile (subject tile), subject eyebrow in accent colour, title, "topic · N questions", 6px bar or ring with "n/N completed", `~N min`, due label, primary Continue, `plant.svg` masked at right. Empty state -> `EmptyState` with caught-up art and "Try a quiz".
- **Your subjects**: horizontal snap-scroll row, 132px cards, `scroll-padding-left: 20px`, subject gradient from tokens, 44px tile with subject icon (`ICON.subject`; maths uses the pi glyph), name 15px/700, "NN% covered" (coverage; do NOT call it mastery), 4px bar in the subject accent, 26px round arrow.
- **Upcoming**: card with rows; tile by item type; title; subtitle; `DateChip`; chevron. Sort by date ascending; hide past items from "Upcoming" (they belong in history).
- **Study tools**: 3-column grid of cards (icon tile on top, title 13.5px, 11.5px hint): Ask Orbit, Scan & Solve, Practice Quiz, Syllabus, Calendar, Progress. (Homework/Classes/Assessments stay under Subject and Upcoming per the IA rules; remove the old root-level list rows only if they are duplicates of these entries, and report it.)

# Phase U4: Grow

- `HeroBanner` "Grow" + `hero-grow.svg`.
- **Explore areas**: horizontal snap row, 138px gradient cards: Interests (purple), Clubs (green), Competitions (orange), Skills (pink) with saturated 42px tiles.
- **Discover prompt** (only when fewer than 2 interests): chips as toggles (selected = solid primary, unselected = outline with "+"), 44px tall, "Not now" as a quiet text button with sufficient contrast.
- **Recommended for you**: horizontal row of 268px cards: 118px header image (use real image if available, otherwise generated topic art; always with a gradient fallback), tag chip, title, one-line description, "Why: ..." line, meta, round arrow. Empty -> `EmptyState` (art, "Nothing to recommend yet", calm line).
- **Upcoming opportunities**: card rows with 48px thumbnail, title, subtitle (e.g. "Register by 10 Oct"), `DateChip`. Empty -> `EmptyState compact`, inside a card (same container as populated state).
- **Your journey**: card with 48px tile, title, subtitle, `ProgressRing` goals n/5.

# Phase U5: Me

- Title "Me" + subtitle "Your journey. Your progress. Your story."
- **Profile card**: 72px initials avatar (gradient, 3px gap ring), name 21px/800, "Grade 8-A · School name", `Edit profile` small button. Support a future photo upload but default to initials.
- **Quote card** below (stacked): quote mark, text 16px/600 (max 72% width), "Edit", `plant.svg` masked right.
- **Quick actions**: 2x2 cards (tile, title, hint).
- **My progress**: one card, 4 columns separated by hairlines (tile, number, label); first column has a 4px bar. Labels: "Syllabus covered", "Tasks done this month", "Days active in a row", "Subjects improving". Action: "View all".
- **Achievements**: horizontal row of 118px cards with `AchievementBadge` (64px), title, hint. Earned = colour; others = locked. Empty (nothing earned) -> show the first 3 as locked with hints so students see what's possible.
- **My interests**: chips with coloured icons (`ICON.interest`), 44px tall. Empty -> chip-shaped "Add interests" CTA.
- **Support**: list card (Help & support, Give feedback, About Orbit with version).
- Quiet framing rule: never label a subject "Needs focus" or similar deficit language. Use "Building" / "Improving" / "Strong".

# Presentation-mapping fixes (report each separately; do not touch data sources)

1. **Subjects:** normalise subject keys for display (`math|science|chemistry|english|...`). If "Chemistry" and "Chemistry Lab" both exist for the same class, show them as separate cards only if the data owner confirms they are distinct; default: show one "Chemistry" card and surface "Lab" as a topic chip. Report what you chose.
2. **Item icon/tone** always from `ICON.item` + `TONE_BY_ITEM_TYPE` (class=blue, homework=green, assessment=amber, study=purple, event=teal), never from the subject.
3. **Dates** always through `formatChip`/`DateChip`. Items dated before today are excluded from "Upcoming" and from recommendations.
4. **Recommendation reason** text only from a genuine match (interest category or title keyword); otherwise show "Open at your school".
5. **Streak vs attendance:** do not show two different "streak" numbers on Home and Me; use one selector for both.

# Phase U6: Polish and verification

- Light theme parity on all four screens (prototype light is the reference): tinted cards (priority, caught-up) use the light variants in `orbit-theme.css`.
- Dynamic type: set `html { font-size }` respects OS scaling; verify at 130% and 160% with no clipped text; verify Telugu strings (longer, taller glyphs).
- Widths: 360, 390, 430; short height 640. No horizontal page scroll; carousels scroll inside their containers.
- A11y: axe-core run in Playwright on each tab (zero serious/critical), screen-reader labels on rings/badges/icon buttons, focus order, `aria-current` on tabs.
- Performance: hero art as `<img>` (cached, `decoding="async"`, explicit width/height), lazy-load below the fold, no layout shift; Lighthouse mobile performance >= 90 on the web build; JS bundle must not grow by more than 15 KB gzipped for this work.
- Remove legacy tokens and any dead styles once nothing references them. Delete any `tailwind.config.js` v3 leftovers.
- Visual regression: Playwright snapshots for all four tabs, dark and light, 390 and 360 widths, with fixture data AND with empty data. Attach side-by-side images against the references.

# Phase report format (every phase)

1. Summary (8 lines max). 2. Commits. 3. Pasted output of `typecheck`, `lint`, `test`, `build`. 4. Screenshots: current vs reference, dark + light. 5. Behaviour check: nothing in stores/repos/RPCs changed (paste `git diff --stat` for non-UI folders, expected empty). 6. Presentation-mapping fixes made. 7. Assumptions, deviations from the reference and why. 8. Remaining gaps. 9. Next phase.

Begin with **Phase U0 only**. Do not modify source files except `docs/ui/AUDIT.md`.

===== END =====

## Follow-up prompts

- Drift: `Compare against docs/ui/orbit-ui-reference.html at 390x844. List every difference in size, colour, spacing, radius, font, weight; then fix only those using tokens.`
- Done too fast: `Show screenshots (dark and light, 390 and 360) for every screen, and paste the visual-diff output. Phase is not complete without them.`
- New dependency creep: `Remove it. Use the primitives and tokens already in the kit.`
- Data looks wrong: `Do not edit data sources. Fix only the presentation mapping and report it.`
