# Orbit — Realistic Startup Cost Plan (INR)

**Scope:** Student + Teacher + School (no Parent portal in v1) · Web + Android + iOS · Basic ₹250 / Pro ₹600 per student / year  
**Stack:** Supabase + hosting + Capacitor apps + Gemini (AI / paper scan)  
**Excludes:** Founder “market salary” fantasy (shown separately as optional). **Includes:** real cash to keep the company alive.

All figures are **planning bands**. Edge cases are called out so you don’t under-budget.

---

## 1) Cost layers (everything that shows up)

| Layer | What it covers |
|--|--|
| **A. Product & platforms** | Hosting, DB, Auth, storage, CDN/CDN, monitoring, backups, domain, SSL |
| **B. AI / paper scan COGS** | Gemini (or similar) under fair-use; overage buffer |
| **C. Mobile stores** | Play ($25 once), Apple (~₹8–9k/yr), screenshots, privacy URLs |
| **D. Compliance & legal** | Privacy policy, terms, DPDP readiness, contracts, GST/CA, trademark (optional) |
| **E. Customer success** | Onboarding, training, WhatsApp/email support, SLAs, escalation |
| **F. Sales / GTM** | Demos, travel, proposals, website, ads/events (optional), partner commissions |
| **G. People (minimum viable ops)** | Even “AI-built” product needs humans for sales/support/ops at school scale |
| **H. Contingency / edge cases** | Outages, AI spike, refunds, bad debt, security incident, app-store rejection rework |

---

## 2) Assumptions for “realistic”

| Assumption | Value |
|--|--|
| Year 1 paid students (end) | **2,000** (mix 70% Basic / 30% Pro) |
| Year 2 | **5,000** same mix |
| Year 3 | **10,000** same mix |
| Fair use (Pro) | 20 AI msgs/day · 5 scans/week · 14-day scan retention |
| Support model | Light WhatsApp desk (not EduNext-scale parent helpdesk) |
| Customisation | **Minimal** — config not custom code (if you customise heavily, add 30–50% to people) |
| Team (realistic floor once selling) | 1 founder-ops + 1 support/CS + 1 part-time sales **or** founder does sales |

---

## 3) Fixed / semi-fixed annual cash (company overhead)

| Item | Lean / yr | Realistic / yr | Notes |
|--|--|--|--|
| Domain + DNS + email | 2,000 | 8,000 | Workspace email if professional |
| Web hosting (Vercel/CF etc.) | 0–10,000 | 20,000 | Pro plan when traffic grows |
| Supabase (base, before heavy usage) | 25,000 | 1,00,000 | Scales with schools; see COGS |
| Monitoring (Sentry etc.) | 0 | 30,000 | Free tier → paid |
| Backups / extra DR | 0 | 40,000 | Beyond default |
| Apple Developer | 9,000 | 9,000 | Yearly |
| Play Console | 2,100 once | — | Year 1 only ~₹2k |
| CA / GST / filings | 15,000 | 50,000 | Pvt Ltd higher |
| Legal (T&Cs, DPDP-ish, MSA) | 25,000 | 1,50,000 | First year heavier |
| Accounting tools / banking | 5,000 | 20,000 | |
| Insurance (optional cyber) | 0 | 40,000 | Smart when 5k+ students |
| Contingency on overhead | 20,000 | 80,000 | |
| **Overhead subtotal** | **~₹1.0L** | **~₹5.5L** | Before people & AI |

---

## 4) Variable tech COGS (scales with students)

### Per student / year (tech only — still valid as *unit COGS*)

| | Basic | Pro (fair-use) | Pro (abuse / no caps) |
|--|--|--|--|
| Platform share (DB/Auth/host) | ₹8–20 | ₹10–25 | ₹15–40 |
| Storage | ₹2–8 | ₹5–20 | ₹20–80 |
| AI text | ₹0 | ₹25–60 | ₹100–300 |
| Paper scan | ₹0 | ₹40–100 | ₹200–700 |
| **Tech COGS total** | **₹10–30** | **₹80–200** | **₹350–1,000+** |

**Planning mid (with caps enforced):** Basic **₹20** · Pro **₹120** / student / year.

### At headcount (70/30 mix)

| Students | Basic 70% | Pro 30% | Mid tech COGS / yr |
|--|--|--|--|
| 2,000 | 1,400 × ₹20 | 600 × ₹120 | **₹1.0L** |
| 5,000 | 3,500 × ₹20 | 1,500 × ₹120 | **₹2.5L** |
| 10,000 | 7,000 × ₹20 | 3,000 × ₹120 | **₹5.0L** |

Add **+40–80% AI buffer** in Year 1–2 until caps are proven in production → e.g. 10k students plan **₹5L–₹9L** tech COGS.

---

## 5) People — the part that makes it “like a real startup”

Even with AI coding, schools expect humans.

| Role | When needed | Lean ₹ / yr | Realistic ₹ / yr |
|--|--|--|--|
| Founder (draw / stipend) | Always | 0–6,00,000 | 12,00,000 |
| Customer support / CS | From first 3–5 schools | 3,00,000–4,50,000 | 6,00,000–8,00,000 |
| Sales (full or strong part-time) | When scaling past ~10 schools | 0–4,00,000 | 8,00,000–15,00,000 + incentives |
| Part-time eng / devops | Production fires | 0–2,00,000 | 4,00,000–8,00,000 |
| **People subtotal (ex-founder salary)** | | **₹3L–6L** | **₹15L–30L** |
| **With modest founder draw** | | **₹6L–12L** | **₹25L–45L** |

EduNext-like full ERP support would be **much** higher; this assumes **narrow product + no parent desk**.

---

## 6) Sales & customer success cash (non-salary)

| Item | Lean / yr | Realistic / yr |
|--|--|--|
| Travel / demos (NCR + 2–3 cities) | 50,000 | 3,00,000 |
| Pitch decks / print / samples | 10,000 | 50,000 |
| WhatsApp Business / phone | 5,000 | 30,000 |
| Lightweight ads / listing sites | 0 | 1,50,000 |
| Partner / referral commissions (5–10% of deal) | 0–2% of revenue | 5–10% of revenue |
| Training materials / LMS for teachers | 10,000 | 50,000 |

---

## 7) Edge cases (budget these explicitly)

| Edge case | What happens | Budget add |
|--|--|--|
| **AI spike / cap bypass** | Shared students abuse Pro | +50–100% of AI COGS that year |
| **Scan image storage blow-up** | Retention bug or HD uploads | +₹50k–3L storage |
| **App Store rejection / rebuild** | Policy, privacy, login | +₹50k–2L time or contractor |
| **Security incident / breach response** | Audit, counsel, credits | +₹1L–10L (insurance helps) |
| **School churn mid-year** | Refunds / credits | Reserve **5–10% of revenue** |
| **Unpaid invoices (schools)** | 30–90 day delays | Working capital **2–3 months opex** |
| **Customisation requests** | “Just like EduNext fees module” | Either **say no** or +₹2L–10L eng |
| **Exam season load** | Attendance + homework peaks | Higher Supabase tier 1–2 months |
| **Multi-school data isolation bug** | Emergency fix | Eng surge |
| **GST / compliance change (DPDP)** | Counsel + product changes | +₹50k–3L |
| **Payment gateway disputes** (if fees later) | Chargebacks | Separate from core SaaS |
| **Currency / API price hike** | Gemini/OpenAI raises rates | Revisit Pro price or tighten caps |

**Rule of thumb:** keep a **₹3L–10L cash buffer** in Year 1; **₹10L–25L** by Year 2–3.

---

## 8) All-in annual budget by stage

### Stage 0 — Launch (first 6–12 months, &lt;500 students)

| | Lean | Realistic |
|--|--|--|
| Overhead + stores + legal | 1.0L | 4.0L |
| Tech COGS | 0.3L | 1.0L |
| People (1 support + founder stipend) | 4.0L | 10.0L |
| Sales travel / GTM | 0.5L | 2.0L |
| Contingency | 1.0L | 3.0L |
| **Total Year 0/1 early** | **~₹7L** | **~₹20L** |

### Stage 1 — ~2,000 students (70/30)

| | Lean | Realistic |
|--|--|--|
| Overhead | 1.5L | 5.0L |
| Tech COGS (+ AI buffer) | 1.5L | 3.0L |
| People | 6.0L | 18.0L |
| GTM / travel / tools | 1.0L | 4.0L |
| Contingency / bad debt reserve | 2.0L | 5.0L |
| **Total / year** | **~₹12L** | **~₹35L** |

**Revenue at 2,000 (70/30):**  
1,400 × 250 + 600 × 600 = **₹3.5L + ₹3.6L = ₹7.1L**  
→ At 2k students you are **likely still loss-making** on realistic people costs unless founder is unpaid and support is shared.

### Stage 2 — ~5,000 students (70/30)

| | Lean | Realistic |
|--|--|--|
| Overhead | 2.5L | 6.0L |
| Tech COGS | 3.5L | 6.0L |
| People | 10.0L | 25.0L |
| GTM | 2.0L | 6.0L |
| Contingency | 3.0L | 8.0L |
| **Total / year** | **~₹21L** | **~₹51L** |

**Revenue:** 3,500 × 250 + 1,500 × 600 = **₹8.75L + ₹9L = ₹17.75L**  
→ Lean can approach break-even; realistic still tight.

### Stage 3 — ~10,000 students (70/30)

| | Lean | Realistic |
|--|--|--|
| Overhead | 4.0L | 8.0L |
| Tech COGS | 5.0L–9.0L | 8.0L–15.0L |
| People | 15.0L | 35.0L |
| GTM | 3.0L | 10.0L |
| Contingency | 5.0L | 12.0L |
| **Total / year** | **~₹32L–40L** | **~₹73L–80L** |

**Revenue:** 7,000 × 250 + 3,000 × 600 = **₹17.5L + ₹18L = ₹35.5L**  
→ **Lean:** roughly break-even to small profit.  
→ **Realistic** (proper team): still need **higher prices, more Pro mix, or lower people** — or raise to ~15–20k students / add modules.

---

## 9) Unit economics — realistic all-in

Don’t use only tech COGS. Allocate company opex across students.

| At 10k students, 70/30 | Lean (~₹35L opex) | Realistic (~₹75L opex) |
|--|--|--|
| **All-in cost / student / year** | **~₹350** | **~₹750** |
| Blended revenue / student | **~₹355** (0.7×250 + 0.3×600) | same |
| **Result** | ~flat | **loss** unless mix shifts to Pro or price rises |

| | Basic ₹250 | Pro ₹600 |
|--|--|--|
| Tech COGS only (mid) | ₹20 | ₹120 |
| **Implied all-in at 10k lean** | ~₹350 allocated* | ~₹350 + extra AI already in COGS |
| **Margin if only tech counted** | Looks huge | Looks fine |
| **Margin if company-loaded** | Basic may be **below** true cost | Pro **carries** the company |

\*Fully loaded average; Pro should bear more AI — still, **Basic alone does not fund a real startup** at ₹250 once support/sales exist.

**Implication:**  
- ₹250 Basic = **land / penetration** price.  
- ₹600 Pro + **high Pro %** = survival.  
- Or raise Basic toward **₹400–500** when you have proof — or sell **campus minimums** (₹X lakh / school) on top of per-student.

---

## 10) Working capital (often forgotten)

Schools pay late. Budget:

- **2–3 months** of opex as cash in bank  
- At realistic Stage 1 (~₹2–3L/month opex) → **₹6–9L** minimum runway beyond “this month’s bills”  
- Year 1 total capital to sleep at night: **₹15L–40L** (lean→realistic), not “₹2L cloud”

---

## 11) What “getting it right” looks like

| Do | Don’t |
|--|--|
| Enforce AI/scan caps in product | Promise unlimited AI |
| Say no to full ERP customisation early | Compete with EduNext feature-for-feature |
| Price campus deals + Pro push | Rely only on Basic seats |
| Hire support before you drown | Assume AI replaces all tickets |
| Keep parent portal out until CS is ready | Open parent floodgates early |
| Hold 10% revenue as churn/bad-debt reserve | Book 100% of contracted ARR as cash |

---

## 12) Executive summary

| Question | Realistic answer |
|--|--|
| Pure cloud + capped AI at 10k? | Still roughly **₹5–15L / year** |
| **Run a startup like this?** | **₹20L–80L / year** depending on stage & team |
| Break-even on ₹250/₹600 70/30? | Around **8–12k students lean**; **15k+ or better mix/pricing** if you staff properly |
| Biggest cost? | **People (support + sales)**, then **AI**, then cloud |
| Biggest risk? | Uncapped AI + customisation + unpaid invoices |
| vs EduNext ₹27 Cr? | You’re cheaper **only while narrow**; if you copy their breadth + support, costs **rhymes with theirs** |

**Bottom line:** Earlier ₹8 / ₹80 figures were **tech unit COGS**.  
**Realistic startup cost** is dominated by **humans + GTM + buffers**, with AI as the dangerous variable. Plan capital and pricing against **₹30L–75L / year** by the time you have ~10k students—not against cloud alone.
