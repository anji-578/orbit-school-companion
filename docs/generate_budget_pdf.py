#!/usr/bin/env python3
"""Generate Orbit Full Budget & Cost Estimation Plan (INR) PDF from canvas source numbers."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path(__file__).resolve().parent / "Orbit-Full-Budget-Cost-Plan-INR.pdf"
FX = 83

# ── helpers ──────────────────────────────────────────────────────────────────


def inr(n: int | float) -> str:
    r = int(round(n))
    if r >= 10_000_000:
        cr = r / 10_000_000
        return f"₹{cr:.0f}Cr" if cr == int(cr) else f"₹{cr:.2f}Cr"
    if r >= 100_000:
        l = r / 100_000
        return f"₹{l:.0f}L" if l == int(l) else f"₹{l:.1f}L"
    return f"₹{r:,}".replace(",", ",")


def inr_full(n: int | float) -> str:
    return f"₹{int(round(n)):,}"


def band(l: int, m: int, h: int) -> str:
    return f"{inr(l)} / {inr(m)} / {inr(h)}"


# ── styles ───────────────────────────────────────────────────────────────────


def build_styles():
    base = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle(
            "TitleIN",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=6,
            alignment=TA_CENTER,
        ),
        "subtitle": ParagraphStyle(
            "SubIN",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#475569"),
            alignment=TA_CENTER,
            spaceAfter=10,
        ),
        "h1": ParagraphStyle(
            "H1IN",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=14,
            spaceAfter=6,
        ),
        "h2": ParagraphStyle(
            "H2IN",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=10,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "BodyIN",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11.5,
            textColor=colors.HexColor("#334155"),
            spaceAfter=4,
        ),
        "small": ParagraphStyle(
            "SmallIN",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#64748b"),
            spaceAfter=3,
        ),
        "callout": ParagraphStyle(
            "CalloutIN",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#1e293b"),
            spaceAfter=2,
        ),
        "cell": ParagraphStyle(
            "CellIN",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7,
            leading=9,
            textColor=colors.HexColor("#1e293b"),
        ),
        "cell_r": ParagraphStyle(
            "CellRIN",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7,
            leading=9,
            textColor=colors.HexColor("#1e293b"),
            alignment=TA_RIGHT,
        ),
        "th": ParagraphStyle(
            "ThIN",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7,
            leading=9,
            textColor=colors.white,
        ),
        "th_r": ParagraphStyle(
            "ThRIN",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7,
            leading=9,
            textColor=colors.white,
            alignment=TA_RIGHT,
        ),
        "footer": ParagraphStyle(
            "FootIN",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7,
            textColor=colors.HexColor("#94a3b8"),
            alignment=TA_CENTER,
        ),
    }
    return styles


HEADER_BG = colors.HexColor("#0f172a")
ALT_ROW = colors.HexColor("#f8fafc")
LINE = colors.HexColor("#e2e8f0")
ACCENT = colors.HexColor("#0ea5e9")
WARN_BG = colors.HexColor("#fff7ed")
OK_BG = colors.HexColor("#f0fdf4")
INFO_BG = colors.HexColor("#f0f9ff")


def make_table(headers, rows, col_widths, styles, right_cols=None):
    right_cols = right_cols or set()
    th = styles["th"]
    thr = styles["th_r"]
    cell = styles["cell"]
    cell_r = styles["cell_r"]

    head = []
    for i, h in enumerate(headers):
        head.append(Paragraph(h, thr if i in right_cols else th))

    data = [head]
    for row in rows:
        cells = []
        for i, val in enumerate(row):
            text = str(val)
            cells.append(Paragraph(text, cell_r if i in right_cols else cell))
        data.append(cells)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ALT_ROW]),
    ]
    t.setStyle(TableStyle(style_cmds))
    return t


def callout_box(title: str, body: str, styles, bg=WARN_BG):
    inner = [
        [
            Paragraph(f"<b>{title}</b>", styles["callout"]),
        ],
        [Paragraph(body, styles["callout"])],
    ]
    t = Table(inner, colWidths=[170 * mm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), bg),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#cbd5e1")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return t


def add_page_number(canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    text = f"Orbit · Full Budget & Cost Plan (INR)  ·  Page {page}"
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#94a3b8"))
    canvas.drawCentredString(A4[0] / 2, 10 * mm, text)
    canvas.setStrokeColor(colors.HexColor("#e2e8f0"))
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, 14 * mm, A4[0] - 18 * mm, 14 * mm)
    canvas.restoreState()


def build():
    styles = build_styles()
    story = []

    # 1. Title
    story.append(Paragraph("Orbit — Full Budget & Cost Estimation Plan (INR)", styles["title"]))
    story.append(
        Paragraph(
            "K-12 multi-persona SPA · Vercel + Supabase + Gemini · India Pvt Ltd setup / ROC / GST / DPDP · "
            f"Planning estimates · FX ₹{FX}/USD · 2025–26 market bands",
            styles["subtitle"],
        )
    )

    # 2. Disclaimer
    story.append(
        callout_box(
            "Disclaimer",
            "These are planning estimates derived from public cloud list prices and typical India 2025–26 "
            "professional-fee bands. They are <b>not</b> vendor quotes, legal advice, tax advice, or accounting "
            f"advice. FX assumption: <b>₹{FX} per USD</b>. Confirm rates with CA/CS and vendors "
            "(vercel.com/pricing, supabase.com/pricing, ai.google.dev) before school-district commitments.",
            styles,
            WARN_BG,
        )
    )
    story.append(Spacer(1, 6))

    # 3. Exclusions
    story.append(Paragraph("1. Exclusions", styles["h1"]))
    story.append(
        Paragraph(
            "<b>Excluded from all mid totals:</b> employee salaries, founder draw, product engineering "
            "contractors, office rent, co-working, utilities, and furniture.",
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            "<b>Included:</b> tech infrastructure (Vercel / Supabase / Gemini / SMS / observability) + "
            "India Year-0 incorporation & licences + annual statutory/compliance (CA/CS retainers, founder-only "
            "email 1–2 seats, accounting SaaS). Optional product contractors: ₹0 mid (excluded); project help "
            "₹2L–₹15L/yr is separate from statutory retainers. Razorpay MDR is pass-through (% of GMV), not fixed OpEx.",
            styles["body"],
        )
    )
    story.append(
        callout_box(
            "Headline — Managed Pro + India setup/compliance (ex-payroll)",
            "Year-0 setup mid <b>₹1.8L</b> · annual compliance mid <b>₹1.35L</b>. "
            "Cash Year-1 mid (infra + compliance + Y0): 1k <b>₹3.7L</b> · 10k <b>₹4.9L</b> · "
            "50k <b>₹11.3L</b> · 100k <b>₹18.1L</b>. AWS is <b>not required</b> at ≤50–100k MAU unless "
            "residency / VPC / RFP mandates it.",
            styles,
            OK_BG,
        )
    )

    # Assumptions (brief)
    story.append(Paragraph("Key assumptions", styles["h2"]))
    assumptions = [
        "MAU = unique authenticated users/month (Student / Parent / Teacher / School).",
        "DAU/MAU ≈ 22% → 1k MAU ≈ 220 DAU; 10k ≈ 2.2k; 50k ≈ 11k; 100k ≈ 22k DAU.",
        "Sessions ≈ 1.4 / DAU / day; most reads/writes go to Supabase (RLS), not Vercel.",
        "Vercel load: /api/gemini, /api/notify, optional /api/razorpay/* — not every page view.",
        "AI blended mid: ~0.4 queries / DAU / day; ~900 in + ~450 out tokens (tutor/quiz text).",
        "Year-0 mid ~₹1.8L; annual compliance mid ~₹1.35L (ex-VAPT in mid).",
    ]
    for i, a in enumerate(assumptions, 1):
        story.append(Paragraph(f"{i}. {a}", styles["small"]))

    # 4. Year-0 setup
    story.append(Paragraph("2. Year-0 setup (one-time ₹)", styles["h1"]))
    story.append(
        Paragraph(
            "Private Limited — most common for funded/SaaS. Low / mid / high are realistic 2025–26 India bands "
            "(state stamp duty moves the high end). Planning mid ≈ sum of item mids.",
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            f"<b>Year-0 band:</b> Low {inr(75000)} · Mid (plan) <b>{inr(180000)}</b> · High {inr(425000)}. "
            f"Amortized view: {inr(60000)}/yr over 3 years — cash Year-1 still needs the full outlay.",
            styles["body"],
        )
    )

    y0_rows = [
        ["Incorporation (SPICe+, MoA/AoA, DIN, DSC×2, stamp, ROC, CA/CS)", "Mandatory", inr(15000), inr(30000), inr(55000), "Stamp duty state/capital-dependent"],
        ["PAN / TAN", "Mandatory", inr(0), inr(2000), inr(5000), "Usually bundled with SPICe+"],
        ["GST registration", "Near-mandatory", inr(0), inr(3000), inr(8000), "Portal free; CA help common"],
        ["Bank current account opening", "Near-mandatory", inr(0), inr(1000), inr(5000), "KYC time is the cost"],
        ["Startup India DPIIT recognition", "Recommended", inr(0), inr(5000), inr(15000), "Mostly free; CA packaging"],
        ["MSME / Udyam registration", "Optional", inr(0), inr(0), inr(2000), "Free self-serve"],
        ["Trademark — Orbit brand (1 class + attorney)", "Recommended", inr(10000), inr(18000), inr(35000), "Renewal ~every 10 years"],
        ["Domain (.in / .com) — first year", "Near-mandatory", inr(1000), inr(2500), inr(5000), "Count once vs infra line"],
        ["Founder tooling — email 1–2 admin seats (Y0)", "Recommended", inr(4000), inr(8000), inr(15000), "Not employee seats"],
        ["Legal basics — Terms, Privacy, DPDP notices", "Recommended", inr(25000), inr(60000), inr(150000), "Commercially expected"],
        ["DPDP / children’s data — edtech advisory", "Recommended", inr(15000), inr(40000), inr(100000), "Consent, retention, processors"],
        ["Payment gateway setup (Razorpay etc.)", "Optional", inr(0), inr(0), inr(5000), "MDR is % of GMV"],
        ["Accounting software (Zoho Books / Clear) — Y0", "Recommended", inr(5000), inr(10000), inr(25000), "SaaS fee only"],
    ]
    story.append(
        make_table(
            ["Item", "Tier", "Low", "Mid", "High", "Notes"],
            y0_rows,
            [58 * mm, 22 * mm, 16 * mm, 16 * mm, 16 * mm, 42 * mm],
            styles,
            right_cols={2, 3, 4},
        )
    )

    # 5. Annual compliance
    story.append(Paragraph("3. Annual compliance (₹ / year)", styles["h1"]))
    story.append(
        Paragraph(
            "Recurring non-people costs after incorporation. Mid excludes full VAPT; high includes pen-test and richer advisory. "
            f"<b>Band:</b> Low {inr(45000)} · Mid (plan) <b>{inr(135000)}</b> · High {inr(350000)}.",
            styles["body"],
        )
    )

    ann_rows = [
        ["ROC filings — AOC-4, MGT-7, DIR-3 KYC, AGM-related (CA/CS)", "Mandatory", inr(15000), inr(35000), inr(80000), "Statutory for Pvt Ltd"],
        ["GST return filing — professional fees", "Near-mandatory", inr(8000), inr(24000), inr(60000), "Depends on turnover"],
        ["Income-tax return / tax-audit professional fees", "Near-mandatory", inr(10000), inr(25000), inr(75000), "Audit trigger is receipts-based"],
        ["Founder email 1–2 seats (ongoing)", "Recommended", inr(4000), inr(8000), inr(15000), "Exclude full team Workspace"],
        ["Accounting software (annual)", "Recommended", inr(5000), inr(10000), inr(25000), "Zoho Books / Clear class"],
        ["Domain renewal", "Near-mandatory", inr(1000), inr(2000), inr(4000), "One domain line"],
        ["DPDP light annual advisory / policy refresh", "Recommended", inr(0), inr(15000), inr(50000), "As school footprint grows"],
        ["Cyber / professional indemnity insurance", "Optional", inr(0), inr(15000), inr(50000), "Often expected by schools"],
        ["Basic VAPT / pen-test (annual)", "Optional", inr(0), inr(0), inr(250000), "Before larger enterprise deals"],
    ]
    story.append(
        make_table(
            ["Item", "Tier", "Low", "Mid", "High", "Notes"],
            ann_rows,
            [58 * mm, 22 * mm, 16 * mm, 16 * mm, 16 * mm, 42 * mm],
            styles,
            right_cols={2, 3, 4},
        )
    )
    story.append(
        Paragraph(
            "<i>Tax audit under Income-tax rules depends on turnover/receipts — not automatic at incorporation. "
            "Your CA confirms whether audit applies in a given year.</i>",
            styles["small"],
        )
    )

    # 6. Scale cases
    story.append(PageBreak())
    story.append(Paragraph("4. Scale cases — Combined Year-1 (Managed Pro)", styles["h1"]))
    story.append(
        Paragraph(
            "Cash Y1 mid = tech infra mid + annual compliance mid (₹1.35L) + Year-0 mid (₹1.8L). "
            "Operating mid = infra + compliance only (ex-Y0). P80 buffers AI/SMS + optional insurance/VAPT upside.",
            styles["body"],
        )
    )

    combined_rows = [
        ["Pilot (1k)", inr(55000), inr(135000), inr(180000), inr(190000), inr(370000), inr(480000), inr(16000)],
        ["Early (10k)", inr(174000), inr(135000), inr(180000), inr(309000), inr(489000), inr(650000), inr(25750)],
        ["Growth (50k)", inr(813000), inr(135000), inr(180000), inr(948000), inr(1128000), inr(1650000), inr(79000)],
        ["Scale (100k)", inr(1494000), inr(135000), inr(180000), inr(1629000), inr(1809000), inr(2800000), inr(135750)],
    ]
    story.append(
        make_table(
            ["Scale", "Tech mid", "Compliance", "Year-0", "Operating", "Cash Y1 mid", "P80", "Mo. op mid"],
            combined_rows,
            [24 * mm, 18 * mm, 20 * mm, 18 * mm, 20 * mm, 22 * mm, 18 * mm, 20 * mm],
            styles,
            right_cols={1, 2, 3, 4, 5, 6, 7},
        )
    )
    story.append(Spacer(1, 4))
    story.append(
        callout_box(
            "Examples",
            "<b>Early 10k:</b> Tech ₹1.7L + compliance ₹1.35L = operating ₹3.1L; + Y0 ₹1.8L → cash Y1 mid "
            f"<b>{inr_full(489000)}</b> · P80 {inr(650000)}.<br/>"
            "<b>Growth 50k:</b> Tech ₹8.1L + compliance ₹1.35L = operating ₹9.5L; + Y0 ₹1.8L → cash Y1 mid "
            f"<b>{inr_full(1128000)}</b> · P80 {inr(1650000)}.",
            styles,
            INFO_BG,
        )
    )

    story.append(Paragraph("Tech infra only — Managed Pro (Year-1 ₹)", styles["h2"]))
    tech_rows = [
        ["Pilot", "1,000", inr(25000), inr(55000), inr(140000), f"~${round(55000/FX):,}"],
        ["Early", "10,000", inr(100000), inr(174000), inr(349000), f"~${round(174000/FX):,}"],
        ["Growth", "50,000", inr(457000), inr(813000), inr(1494000), f"~${round(813000/FX):,}"],
        ["Scale", "100,000", inr(830000), inr(1494000), inr(2905000), f"~${round(1494000/FX):,}"],
    ]
    story.append(
        make_table(
            ["Scale", "MAU", "Low Y1", "Mid Y1", "High Y1", "USD mid (ref)"],
            tech_rows,
            [28 * mm, 24 * mm, 24 * mm, 24 * mm, 28 * mm, 32 * mm],
            styles,
            right_cols={1, 2, 3, 4, 5},
        )
    )

    story.append(Paragraph("Usage model snapshot", styles["h2"]))
    usage_rows = [
        ["DAU (22% of MAU)", "220", "2,200", "11,000", "22,000"],
        ["Sessions / day", "~310", "~3,100", "~15,400", "~30,800"],
        ["Supabase API / day (≈25/session)", "~8k", "~77k", "~385k", "~770k"],
        ["AI queries / day (mid)", "~90", "~880", "~5,000", "~10,000"],
        ["AI tokens / mo (mid)", "~4M", "~40M", "~220M", "~440M"],
        ["DB size end Y1 (mid)", "0.5–2 GB", "2–6 GB", "8–25 GB", "20–50 GB"],
        ["File storage mid", "1–5 GB", "5–20 GB", "30–120 GB", "60–250 GB"],
    ]
    story.append(
        make_table(
            ["Metric", "1k MAU", "10k MAU", "50k MAU", "100k MAU"],
            usage_rows,
            [48 * mm, 28 * mm, 28 * mm, 28 * mm, 28 * mm],
            styles,
            right_cols={1, 2, 3, 4},
        )
    )

    # 7. Platform cases & AWS
    story.append(Paragraph("5. Platform cases & AWS verdict", styles["h1"]))
    story.append(
        Paragraph(
            f"Mid-case Year-1 tech TCO by platform. India Year-0 + annual compliance stack on top of any "
            f"choice (~{inr(180000 + 135000)} mid in Year-1 cash). <b>Managed Pro</b> is the recommended default.",
            styles["body"],
        )
    )

    plat_rows = [
        ["A · Lean Hobby→Pro", inr(35000), band(60000, 123000, 241000), band(266000, 448000, 913000), inr(830000)],
        ["B · Managed Pro ★", inr(55000), band(100000, 174000, 349000), band(457000, 813000, 1494000), inr(1494000)],
        ["C · Managed Team", inr(720000), band(720000, 890000, 1200000), band(1100000, 1550000, 2400000), inr(2300000)],
        ["D · AWS mid", inr(498000), band(498000, 996000, 1992000), band(1162000, 2324000, 4565000), inr(4150000)],
        ["E · AWS enterprise", inr(1494000), band(1660000, 2988000, 4980000), band(3320000, 5810000, 9960000), inr(9130000)],
        ["F · GCP / Railway·Fly", inr(83000), band(149000, 266000, 498000), band(498000, 913000, 1660000), inr(1660000)],
    ]
    story.append(
        make_table(
            ["Platform", "1k mid", "10k L / M / H", "50k L / M / H", "100k mid"],
            plat_rows,
            [36 * mm, 22 * mm, 42 * mm, 42 * mm, 22 * mm],
            styles,
            right_cols={1, 4},
        )
    )
    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            "<b>Platform notes:</b> A — upgrade only when limits force it. B — Vercel Pro + Supabase Pro "
            "(recommended Y1). C — SSO, SOC2, longer SLAs. D — Amplify/CloudFront + Lambda + RDS/Aurora or ECS + Cognito. "
            "E — Multi-AZ, WAF, light multi-region DR. F — more control than BaaS; lighter ops than full AWS "
            f"({inr(266000)} @10k · {inr(913000)} @50k) — usually not worth rebuilding Auth/RLS in Year 1.",
            styles["small"],
        )
    )

    story.append(Paragraph("AWS needed? by scale", styles["h2"]))
    aws_rows = [
        ["Pilot", "1,000", "No", "Hobby/Free or Pro is ample; AWS adds cost and delay"],
        ["Early", "10,000", "No", "Managed Pro handles SPA + Postgres + Auth comfortably"],
        ["Growth", "50,000", "No", "Still within Pro unless residency/procurement forces named cloud"],
        ["Scale", "100,000", "Rarely", "Usually still Pro; AWS only for compliance, VPC, multi-region DR, or RFP"],
    ]
    story.append(
        make_table(
            ["Scale", "MAU", "AWS needed?", "Why"],
            aws_rows,
            [24 * mm, 22 * mm, 28 * mm, 96 * mm],
            styles,
            right_cols={1},
        )
    )
    story.append(
        callout_box(
            "AWS verdict",
            "Honest: AWS is usually <b>not</b> required at ≤50–100k MAU. Justify only for India residency/VPC, "
            "multi-region DR, named-cloud RFPs, or isolation beyond shared BaaS. Stay on Vercel + Supabase Pro; "
            "escalate cloud only on written compliance/procurement requirements.",
            styles,
            OK_BG,
        )
    )

    story.append(Paragraph("Upgrade triggers", styles["h2"]))
    trig_rows = [
        ["Hobby bandwidth / function / build limits or need team previews", "Vercel Hobby → Pro (~₹1.7k/mo + usage)"],
        ["Supabase Free pause risk, >500 MB DB, or need daily backups", "Supabase Free → Pro (~₹2.1k/mo)"],
        ["DB CPU/RAM pressure, connection saturation, slow dashboards", "Compute Micro → Small (~₹1.2k) → Medium (~₹5k)/mo"],
        ["Districts require SOC2 / SSO / longer backup retention", "Supabase Pro → Team (~₹50k/mo) — governance, not capacity"],
        ["AI spend > ~30% of monthly tech OpEx or latency SLOs fail", "Cache prompts, cap queries/user, Flash-Lite only"],
        ["School RFPs ask for pen-test / cyber insurance certificates", "Add VAPT (₹1–2.5L) + PI/cyber premium"],
        ["India residency, VPC isolation, multi-region DR, or enterprise RFP", "Evaluate AWS/GCP — not required by MAU alone at ≤100k"],
    ]
    story.append(
        make_table(
            ["Trigger", "Action"],
            trig_rows,
            [85 * mm, 85 * mm],
            styles,
        )
    )

    # 8. Other recurring / AI
    story.append(PageBreak())
    story.append(Paragraph("6. Other recurring tech costs & AI note", styles["h1"]))

    story.append(Paragraph("Category deep-dive — Managed Pro (annual ₹)", styles["h2"]))
    story.append(Paragraph("<b>10,000 MAU</b>", styles["body"]))
    cat_early = [
        ["Hosting / CDN / serverless (Vercel)", inr(0), inr(35000), inr(75000), "Hobby free → Pro ~$20/seat/mo + usage"],
        ["DB + Auth + Realtime + Storage (Supabase)", inr(25000), inr(35000), inr(75000), "Pro $25/mo; compute; disk; egress"],
        ["AI (Gemini Flash-Lite class)", inr(5000), inr(20000), inr(60000), "~$0.10/$0.40 per 1M in/out tokens"],
        ["Transactional email / SMS / push", inr(2000), inr(22000), inr(66000), "MSG91 SMS dominates if OTP on"],
        ["Domain + SSL (infra line)", inr(1000), inr(1500), inr(3000), "Overlap with Year-0 — count once"],
        ["Observability (Sentry, logs, uptime)", inr(0), inr(8000), inr(30000), "Sentry free→Team"],
        ["Backups / PITR / DR", inr(0), inr(5000), inr(20000), "Pro daily backups 7d included"],
        ["Contingency on tech (~10–15%)", inr(10000), inr(20000), inr(45000), "Price/SMS/AI swings"],
    ]
    story.append(
        make_table(
            ["Category", "Low", "Mid", "High", "Drivers"],
            cat_early,
            [52 * mm, 18 * mm, 18 * mm, 18 * mm, 64 * mm],
            styles,
            right_cols={1, 2, 3},
        )
    )

    story.append(Paragraph("<b>50,000 MAU</b>", styles["body"]))
    cat_growth = [
        ["Hosting / CDN / serverless (Vercel)", inr(40000), inr(100000), inr(232000), "Fluid CPU/memory; CDN quotas"],
        ["DB + Auth + Realtime + Storage (Supabase)", inr(50000), inr(100000), inr(299000), "Micro→Small/Medium; disk >8 GB"],
        ["AI (Gemini Flash-Lite class)", inr(30000), inr(91000), inr(299000), "Vision/OCR = high band"],
        ["Transactional email / SMS / push", inr(7000), inr(87000), inr(299000), "MSG91 is volatile"],
        ["Domain + SSL (infra line)", inr(1000), inr(1500), inr(5000), "Count once"],
        ["Observability (Sentry, logs, uptime)", inr(10000), inr(33000), inr(100000), "Optional log drain"],
        ["Backups / PITR / DR", inr(0), inr(17000), inr(60000), "PITR / longer retention optional"],
        ["Contingency on tech (~10–15%)", inr(40000), inr(90000), inr(180000), "In platform L/M/H bands"],
    ]
    story.append(
        make_table(
            ["Category", "Low", "Mid", "High", "Drivers"],
            cat_growth,
            [52 * mm, 18 * mm, 18 * mm, 18 * mm, 64 * mm],
            styles,
            right_cols={1, 2, 3},
        )
    )

    story.append(Paragraph("Adjacent / GTM-light (still ex-payroll, ex-office)", styles["h2"]))
    other_rows = [
        ["GTM-light (content, ads, school events)", inr(0), inr(50000), inr(250000), "Optional — not in cash Y1 mid"],
        ["Product contractors (optional soft)", "₹0", "Excluded", "₹2–15L", "Separate from CA/CS retainers"],
        ["Payment MDR (Razorpay)", "—", "% of GMV", "—", "Pass-through; not fixed OpEx"],
        ["Contingency on tech", "~10%", "~12%", "~15%", "Baked into platform bands"],
    ]
    story.append(
        make_table(
            ["Cost", "Low", "Mid", "High", "Treatment"],
            other_rows,
            [52 * mm, 20 * mm, 24 * mm, 22 * mm, 52 * mm],
            styles,
            right_cols={1, 2, 3},
        )
    )

    story.append(Paragraph("AI sensitivity band (Gemini) — Year-1 ₹", styles["h2"]))
    story.append(
        Paragraph(
            "Volatile OpEx line after SMS. Prefer gemini-flash-lite · cap queries per student/day · cache syllabus "
            "prompts · avoid vision/OCR as default. At 50k heavy AI alone can approach ₹3.0L/yr.",
            styles["body"],
        )
    )
    ai_rows = [
        ["Pilot (1k)", inr(2000), inr(8000), inr(35000), inr(33000), "~0.1 / 0.4 / 2+ AI queries per DAU/day"],
        ["Early (10k)", inr(5000), inr(20000), inr(60000), inr(55000), "Flash-Lite text vs vision/OCR spikes"],
        ["Growth (50k)", inr(30000), inr(91000), inr(299000), inr(269000), "AI can be 10–35% of tech OpEx at heavy"],
        ["Scale (100k)", inr(60000), inr(180000), inr(580000), inr(520000), "Cap per-user; cache prompts"],
    ]
    story.append(
        make_table(
            ["Scale", "Light", "Moderate", "Heavy", "Swing L→H", "Note"],
            ai_rows,
            [26 * mm, 18 * mm, 20 * mm, 20 * mm, 22 * mm, 64 * mm],
            styles,
            right_cols={1, 2, 3, 4},
        )
    )

    story.append(Paragraph("Phased Year-1 (measured ramp)", styles["h2"]))
    story.append(
        Paragraph(
            "Q1 front-loads Year-0 incorporation + legal/DPDP packs with pilot infra (~1k MAU). "
            "Q2–Q4 ramp schools while annual ROC/GST/CA run-rate settles. Measured ramp ends ~₹3.3L cumulative "
            "operating+compliance before a dense 50k infra path (~₹8L+ tech alone).",
            styles["body"],
        )
    )
    phase_rows = [
        ["Q1", "Incorporate + legal/DPDP packs + pilot infra", inr(45000), inr(45000)],
        ["Q2", "Early schools, Supabase Pro, ROC/GST cadence starts", inr(70000), inr(115000)],
        ["Q3", "Growth traffic, AI/SMS monitoring", inr(95000), inr(210000)],
        ["Q4", "Stabilize toward 10–50k path", inr(120000), inr(330000)],
    ]
    story.append(
        make_table(
            ["Quarter", "Focus", "Quarterly mid", "Cumulative"],
            phase_rows,
            [22 * mm, 88 * mm, 30 * mm, 30 * mm],
            styles,
            right_cols={2, 3},
        )
    )

    # 9. Tradeoffs
    story.append(Paragraph("7. Tradeoffs summary", styles["h1"]))
    story.append(
        Paragraph(
            "Cost · ops burden · time-to-ship · lock-in · compliance fit · team skills — qualitative for Indian school SaaS Year 1.",
            styles["body"],
        )
    )
    trade_rows = [
        ["Lean Hobby→Pro", "Lowest", "Lowest", "Fastest", "Medium (BaaS)", "Weak if Free pauses", "Low"],
        ["Managed Pro ★", "Low–mid", "Low", "Fast", "Medium", "Good (Mumbai + DPA)", "Low (TS + SQL/RLS)"],
        ["Managed Team", "High fixed", "Low", "Fast", "Medium", "Strong (SOC2/SSO)", "Low"],
        ["AWS mid", "High", "High", "Slow", "High (IAM/VPC)", "Strong if designed", "High (cloud eng)"],
        ["AWS enterprise", "Highest", "Highest", "Slowest", "Highest", "Strongest", "Highest"],
        ["GCP / Railway·Fly", "Mid", "Mid", "Medium", "Medium–high", "Varies", "Mid"],
    ]
    story.append(
        make_table(
            ["Platform", "Cost", "Ops", "Ship speed", "Lock-in", "Compliance", "Skills"],
            trade_rows,
            [30 * mm, 20 * mm, 18 * mm, 20 * mm, 28 * mm, 32 * mm, 22 * mm],
            styles,
        )
    )
    story.append(Spacer(1, 4))
    story.append(
        callout_box(
            "AI + SMS volatility",
            "Gemini spend moves with product design, not host choice. MSG91 SMS is the other India-specific spike — "
            "DLT templates and per-school broadcast limits matter more than CDN pricing. Company-law compliance cost "
            "is mostly fixed vs MAU.",
            styles,
            INFO_BG,
        )
    )

    # Recommended budgets / board one-liner
    story.append(Paragraph("Recommended Year-1 budgets to approve", styles["h2"]))
    story.append(
        Paragraph(
            "Cash Y1 mid = Managed Pro tech + annual compliance (₹1.35L) + Year-0 (₹1.8L). "
            "P80 buffers AI/SMS and optional VAPT/insurance. Excludes salaries and office.",
            styles["body"],
        )
    )
    rec_rows = [
        ["Pilot 1k", inr(370000), inr(480000), f"Tech {inr(55000)} · AWS: No"],
        ["Early 10k", inr(489000), inr(650000), f"Tech {inr(174000)} · AWS: No"],
        ["Growth 50k", inr(1128000), inr(1650000), f"Tech {inr(813000)} · AWS: No"],
        ["Scale 100k", inr(1809000), inr(2800000), f"Tech {inr(1494000)} · AWS: Rarely"],
    ]
    story.append(
        make_table(
            ["Scale", "Cash Y1 mid", "P80 buffer", "Notes"],
            rec_rows,
            [30 * mm, 30 * mm, 30 * mm, 80 * mm],
            styles,
            right_cols={1, 2},
        )
    )
    story.append(Spacer(1, 6))
    story.append(
        callout_box(
            "Board / founder one-liner",
            f"Approve cash Year-1 mid <b>{inr(489000)}</b> for Early (10k) and <b>{inr(1128000)}</b> for Growth (50k), "
            f"with P80 buffers {inr(650000)} / {inr(1650000)}. That covers Managed Pro tech, Year-0 India setup "
            f"(~{inr(180000)}), and annual ROC/GST/CA/DPDP run-rate (~{inr(135000)}) — still excluding payroll and office. "
            "Stay on Vercel + Supabase Pro; escalate cloud only on written compliance/procurement requirements.",
            styles,
            OK_BG,
        )
    )

    story.append(Spacer(1, 10))
    story.append(
        Paragraph(
            f"Source of truth: Orbit canvas budget model · FX ₹{FX}/USD · planning estimates 2025–26 · "
            "not legal/tax advice. Document generated for founder / board planning.",
            styles["small"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=18 * mm,
        title="Orbit — Full Budget & Cost Estimation Plan (INR)",
        author="Orbit",
    )
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Wrote {OUT}")
    return OUT


if __name__ == "__main__":
    build()
