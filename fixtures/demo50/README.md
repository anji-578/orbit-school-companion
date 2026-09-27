# DEMO50 — Client review school pack

**Sunrise Demo Academy** — a complete 50-student onboarding dataset for school demos.

| Field | Value |
|--|--|
| School | Sunrise Demo Academy |
| Code | `DEMO50` |
| City | Hyderabad |
| Shared password | `Demo50!` |
| Email domain | `@demo50.orbit.app` |
| Academic year | 2025–26 |

## Master workbook

Open **`DEMO50_Client_Pack.xlsx`** — sheets:

1. **Quick_Start** — 4 logins for the live walkthrough  
2. **Login_Directory** — every credential (school / teachers / parents / students)  
3. **Students** — roster, marks, attendance %, fees, bus, class teacher  
4. **Parents** — guardians + demo scripts  
5. **Parent_Child_Links** — who is linked to whom  
6. **Teachers** — subjects + multi-class lists  
7. **Fees** — line items by student  
8. **Timetable** — Mon–Fri periods per class  
9. **Demo_Scenarios** — ordered client demo script with expected outcomes  
10. **Edge_Cases** — (see EDGE_CASES.md)

## Counts

| Entity | Count |
|--|--|
| Students | 50 |
| Parents | 46 |
| Teachers | 5 |
| School admins | 1 |
| Fee lines | 97 |
| Auth logins | 101 |
| Parent↔child links | 49 |
| Timetable rows | 150 |

## Headline credentials (memorize these four)

| Role | Email | Password |
|--|--|--|
| School | `admin@demo50.orbit.app` | `Demo50!` |
| Teacher (lead) | `teacher01@demo50.orbit.app` | `Demo50!` |
| Parent (3 kids) | `parent001@demo50.orbit.app` | `Demo50!` |
| Student (GK demo) | `student040@demo50.orbit.app` | `Demo50!` |

## How this maps to the product

| Sheet column / tag | Product surface |
|--|--|
| `class_label` + teacher `classes` | Teacher class switcher |
| `fee_status` / Fees sheet | Parent Payments + School Fee Auditor |
| `attendance_pct` / chronic_absent | Teacher Attendance + parent alerts |
| `math_mark` etc. | Teacher Marks + Academics |
| Timetable sheet | Student schedule / school timetable |
| `confidential_docs` / teacher vault | Profile secure folders |
| `gk_quiz_champion` | Student GK Quiz module |
| `competition_enrolled` | Competitions → profile loop |
| Sibling parents | Parent child switcher |

## Regenerate

```bash
npm run demo50:generate
```

## Note on live Supabase

This pack is the **source of truth for the client meeting**.  
Existing live pilot data may still be `PILOT100` — use this workbook for credentials storytelling even if you demo on local/demo auth, or provision DEMO50 separately when ready.
