# Sunrise Demo Academy — Client Review Guide

Use this with **`DEMO50_Client_Pack.xlsx`** (same folder).

Shared password for every DEMO50 account: **`Demo50!`**

---

## 1. Meeting goal (2 minutes)

Show that Orbit is a **school companion**, not only an ERP:

| Stakeholder | What they feel in the first 60 seconds |
|--|--|
| School | Control of roster, fees, ops |
| Teacher | One place for many classes + parent outreach |
| Parent | Clarity on child, money, alerts |
| Student | Learning loop (quiz, homework, competitions, profile) |

---

## 2. Four “hero” logins (run these live)

| # | Role | Email | Password | Open first |
|--|--|--|--|--|
| 1 | School | `admin@demo50.orbit.app` | `Demo50!` | Dashboard → Fee Auditor → Roster |
| 2 | Teacher | `teacher01@demo50.orbit.app` | `Demo50!` | Class chips → Attendance → Message Parents → Profile |
| 3 | Parent | `parent001@demo50.orbit.app` | `Demo50!` | Child switcher (3 kids) → Payments → Alerts |
| 4 | Student | `student040@demo50.orbit.app` | `Demo50!` | Home → GK Quiz → Competitions → Profile vault |

All other credentials are in the **Login_Directory** sheet.

---

## 3. Recommended 25-minute demo script

### A. School admin (5 min) — `admin@demo50.orbit.app`

1. **Dashboard** — whole-school pulse.  
2. **Fee Auditor** — call out student **#13** (overdue tuition).  
3. **Roster** — show Grade 8-A density; mention student **#30** has *no parent link* (edge).  
4. **Broadcast / Calendar / Fleet** — ops surfaces exist without leaving Orbit.

**Talk track:** “Admin sees money, people, and operations without juggling WhatsApp groups.”

### B. Teacher (8 min) — `teacher01@demo50.orbit.app` (Mrs. Kavitha Reddy)

1. **Class switcher** in sidebar: `Grade 8-A` → `Grade 5-A` → `Grade 8-B`.  
   - Roster changes with the active class.  
2. Stay on **Grade 8-A** → **Attendance** → mention **#24** (chronic absent scenario).  
3. **Message Parents** → search **#26** (weak Math) → send a short note.  
4. **Teacher Profile** (click avatar) → subjects / classes / qualifications → **Secure folder** upload.  
5. Optional: Homework / Marks / Syllabus for the same active class.

**Talk track:** “One teacher, five classes — context never gets lost.”

### C. Parent (6 min) — `parent001@demo50.orbit.app` (Suresh Rao)

1. **Child switcher** — 3 children: idx **21**, **9**, **46** (8-A / 6-A / 9-A).  
2. **Payments** — unpaid / overdue stories (also try parent of student **#13** for overdue).  
3. **Alerts** — attendance / teacher message / fee reminders.  
4. Optional: Transport for student **#48**.

**Talk track:** “Parents stop chasing teachers for ‘what happened today?’”

### D. Student (6 min) — `student040@demo50.orbit.app`

1. **Home** priority companion (today → tasks → discover).  
2. **GK Quiz** — all questions on one page → submit → green/red review; Easy/Medium/Hard all open.  
3. **Competitions** — register flow (student **#41** if you want a dedicated persona).  
4. **Academic Profile** → **Confidential Documents** vault (student **#42**).

**Talk track:** “Students get a companion — quizzes, competitions, identity — not only marks.”

---

## 4. Edge cases mapped to people (use the sheet)

Open **Demo_Scenarios** + **EDGE_CASES.md**. Highlights:

| Scenario | Who | Why it matters in a sales review |
|--|--|--|
| 3 siblings | parent001 · students 21, 9, 46 | Multi-child switcher |
| Overdue fees | student 13 | Fee Auditor + parent Payments |
| No fees | student 11 | Empty fee state |
| Pending UTR | student 14 | Payment verification path |
| Chronic absent | student 24 | Attendance → parent alert |
| Weak Math | student 26 | Teacher message to parent |
| Topper | student 27 | Strong academics story |
| Unlinked student | student 30 | School still manages; no parent |
| Parent-only login | student 31 / their parent | Child without student account |
| Telugu / Hindi names | students 32, 33 | i18n / Unicode |
| GK quiz hero | student 40 | Learning module |
| Competition | student 41 | Profile loop |
| Private vault | student 42 | Secure documents |
| Duplicate names | Priya Sharma ×2 (8 & 19) | Identity / search clarity |
| Special characters | D'Souza, Mary-Anne, Al-Hassan | Roster robustness |

---

## 5. Product surface checklist (pre-meeting)

Tick before the client arrives:

### Student
- [ ] Home hierarchy loads (Today → Priority → … → Discover)
- [ ] GK Quiz: full list, submit, green/red review, all levels open
- [ ] Competitions register / pay (demo)
- [ ] Academic Profile + confidential upload/open/delete
- [ ] Homework start/complete + XP toast
- [ ] Language toggle EN/TE

### Parent
- [ ] Child switcher (parent001)
- [ ] Payments unpaid/overdue
- [ ] Alerts for attendance / teacher notes
- [ ] Transport demo student

### Teacher
- [ ] Class switcher updates roster context
- [ ] Attendance mark → parent notification
- [ ] Message Parents search + send
- [ ] Profile + secure folder
- [ ] Homework / marks / syllabus on active class

### School
- [ ] Fee Auditor filters
- [ ] Roster / invites
- [ ] Broadcast, calendar, fleet, hiring visible

### Cross-cutting
- [ ] No console errors on hero paths
- [ ] Mobile width usable for parent/teacher
- [ ] Demo password works for all four hero accounts

---

## 6. What “onboarding a real school” looks like (pitch)

Hand them the workbook and say:

1. **School row** — name, code, UPI, academic year  
2. **Teachers sheet** — subjects + classes each teacher owns  
3. **Students sheet** — class, roll, marks baseline, bus, class teacher  
4. **Parents + links** — who can see whom  
5. **Timetable** — period grid per class  
6. **Fees** — opening balances / statuses  
7. **Login_Directory** — day-1 credentials for training

Orbit already mirrors this structure in product surfaces (roster, fees, timetable, parent links, teacher classes).

---

## 7. Fallback if DEMO50 Auth is not provisioned yet

| Mode | How to demo |
|--|--|
| Local / built-in demos | `student@orbit.app` / `parent@orbit.app` / `teacher@orbit.app` / `admin@orbit.app` (see app landing hints) |
| Existing PILOT100 cloud | Use `*@pilot100.orbit.app` + `Pilot100!` (100-student pack) |
| This workbook | Always use DEMO50 sheets for the *story* and named scenarios |

---

## 8. Files in this folder

| File | Purpose |
|--|--|
| `DEMO50_Client_Pack.xlsx` | **Give this to the client** |
| `login_directory.csv` | Flat credential export |
| `students.csv` / `parents.csv` / `teachers.csv` | Onboarding tables |
| `parent_child_links.csv` | Relationship map |
| `fees.csv` / `timetable.csv` | Money + schedule |
| `demo_scenarios.csv` | Ordered demo script |
| `EDGE_CASES.md` | Why each weird row exists |
| `CLIENT_REVIEW_GUIDE.md` | This guide |
| `README.md` | Pack overview |

Regenerate anytime: `npm run demo50:generate`
