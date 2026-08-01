# PILOT100 — disposable 100-student test school

Indian-name roster with **edge cases** for onboarding QA. Safe to delete when a real school arrives.

| Field | Value |
|--|--|
| School | Orbit Pilot Academy |
| Code | `PILOT100` |
| Shared password | `Pilot100!` |
| Domain | `@pilot100.orbit.app` |

## Excel / CSV files

| File | Contents |
|--|--|
| `PILOT100_onboarding.xlsx` | All sheets in one workbook |
| `students.csv` | 100 students + `edge_case` column |
| `parents.csv` | ~96 parents |
| `parent_child_links.csv` | Parent ↔ child mapping (siblings included) |
| `teachers.csv` | 5 teachers |
| `fees.csv` | Fee lines with Paid/Unpaid/Pending/Overdue |
| `login_directory.csv` | All Auth emails + passwords for testing |
| `EDGE_CASES.md` | Why each weird row exists |
| `manifest.json` | Counts |

## Apply to Supabase

```bash
# 1) Regenerate fixtures + auth SQL (optional)
npm run pilot100:generate

# 2) Seed roster/fees/attendance/homework/ops
#    SQL Editor: supabase/pilot100_seed.sql

# 3) Create Auth users + profiles + parent_links (pick one)
#    A) SQL Editor: supabase/pilot100_auth.sql   (no service-role key needed)
#    B) Or: SUPABASE_SERVICE_ROLE_KEY=... npm run pilot100:provision

# 4) Tear down later
npm run pilot100:teardown
#    (needs SUPABASE_SERVICE_ROLE_KEY) — or delete school PILOT100 + *@pilot100.orbit.app in dashboard
```

## Quick smoke logins

| Role | Email | Password |
|--|--|--|
| School | `admin@pilot100.orbit.app` | `Pilot100!` |
| Teacher | `teacher01@pilot100.orbit.app` | `Pilot100!` |
| Parent (3 kids) | `parent001@pilot100.orbit.app` | `Pilot100!` |
| Student | `student001@pilot100.orbit.app` | `Pilot100!` |

**Live status (orbit-os):** school `PILOT100` seeded with 100 students, ~201 Auth users, 99 parent links. Shared password for all: `Pilot100!`

After school login, set **active class** if needed (`Grade 8-A` is seeded). Parent001 should show the child switcher.

## Edge cases covered

Apostrophe / hyphen / long names, Telugu & Hindi script names, empty section, duplicate names, 3-sibling family, unlinked student, no fees / overdue / pending, chronic absentee, Grade 10 outside main policy class, parent-without-student-login (`student060`), etc.
