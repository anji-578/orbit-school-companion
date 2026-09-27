#!/usr/bin/env node
/**
 * DEMO50 — client-review school pack (50 students · ~47 parents · 5 teachers · 1 school).
 * Run: node scripts/generate-demo50.mjs
 *
 * Outputs fixtures/demo50/*.csv + DEMO50_Client_Pack.xlsx + docs + seed SQL stub notes.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')
const outDir = join(root, 'fixtures', 'demo50')
mkdirSync(outDir, { recursive: true })

const SCHOOL = {
  code: 'DEMO50',
  name: 'Sunrise Demo Academy',
  city: 'Hyderabad',
  upi: 'sunrise.demo50@oksbi',
  academicYear: '2025–26',
}

const PASSWORD = 'Demo50!'
const DOMAIN = 'demo50.orbit.app'

const FIRST = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Kabir',
  'Ananya', 'Aadhya', 'Diya', 'Myra', 'Saanvi', 'Anika', 'Kiara', 'Navya', 'Ira', 'Meera',
  'Rohan', 'Karthik', 'Nikhil', 'Varun', 'Siddharth', 'Dev', 'Yash', 'Om', 'Rahul', 'Pranav',
  'Priya', 'Sneha', 'Isha', 'Kavya', 'Tanvi', 'Riya', 'Harini', 'Lakshmi', 'Gayatri', 'Radha',
  'Tejas', 'Ravi', 'Manoj', 'Neha', 'Pooja', 'Shruti', 'Zara', 'Aisha', 'Kiran', 'Sahana',
]

const LAST = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Menon', 'Gupta', 'Singh', 'Khan',
  'Das', 'Banerjee', 'Mukherjee', 'Joshi', 'Mehta', 'Kapoor', 'Rao', 'Pillai', 'Shetty', 'Hegde',
]

function csvEscape(v) {
  const s = v == null ? '' : String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(headers, rows) {
  return (
    [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\n') +
    '\n'
  )
}

function studentId(n) {
  return `d5000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

function parentId(n) {
  return `d5100000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

function makeStudents() {
  const plan = [
    { class_name: 'Grade 5', section: 'A', count: 8 },
    { class_name: 'Grade 6', section: 'A', count: 10 },
    { class_name: 'Grade 7', section: 'A', count: 10 },
    { class_name: 'Grade 8', section: 'A', count: 12 },
    { class_name: 'Grade 8', section: 'B', count: 5 },
    { class_name: 'Grade 9', section: 'A', count: 5 },
  ]

  const students = []
  let n = 1
  for (const cls of plan) {
    for (let i = 1; i <= cls.count; i++) {
      const first = FIRST[(n * 2 + i) % FIRST.length]
      const last = LAST[(n * 5 + i) % LAST.length]
      students.push({
        idx: n,
        id: studentId(n),
        display_name: `${first} ${last}`,
        class_name: cls.class_name,
        section: cls.section,
        class_label: `${cls.class_name}-${cls.section}`,
        roll_no: String(i).padStart(2, '0'),
        edge_case: 'standard',
        scenario_tag: '',
        gender_hint: n % 2 === 0 ? 'F' : 'M',
        math_mark: 55 + ((n * 7) % 40),
        science_mark: 50 + ((n * 11) % 45),
        english_mark: 60 + ((n * 3) % 35),
        attendance_pct: 78 + (n % 20),
        fee_status: n % 5 === 0 ? 'Paid' : n % 7 === 0 ? 'Overdue' : 'Unpaid',
        bus_route: n % 3 === 0 ? 'Route A' : n % 3 === 1 ? 'Route B' : 'Walk / Own',
        class_teacher: '',
      })
      n += 1
    }
  }

  // Edge / demo scenarios (attributed to concrete students)
  const edges = [
    { idx: 1, display_name: "Aarav D'Souza", edge_case: 'apostrophe_surname', scenario_tag: 'name_special_chars' },
    { idx: 2, display_name: 'Mary-Anne Joseph', edge_case: 'hyphenated_given', scenario_tag: 'name_special_chars' },
    { idx: 3, display_name: 'Muhammad Ibrahim Al-Hassan', edge_case: 'long_multi_part_name', scenario_tag: 'name_special_chars' },
    { idx: 4, display_name: 'Chinnu', edge_case: 'single_word_name', scenario_tag: 'name_special_chars' },
    { idx: 5, display_name: 'Ñisha O\'Brien', edge_case: 'unicode_name', scenario_tag: 'name_special_chars' },
    { idx: 6, section: '', class_label: 'Grade 5', edge_case: 'empty_section', scenario_tag: 'roster_edge' },
    { idx: 7, roll_no: '99', edge_case: 'non_sequential_roll', scenario_tag: 'roster_edge' },
    { idx: 8, display_name: 'Priya Sharma', edge_case: 'duplicate_name_a', scenario_tag: 'duplicate_name' },
    { idx: 19, display_name: 'Priya Sharma', edge_case: 'duplicate_name_b', scenario_tag: 'duplicate_name' },
    { idx: 21, edge_case: 'sibling_group_a_child1', scenario_tag: 'multi_child_parent', class_name: 'Grade 8', section: 'A', class_label: 'Grade 8-A' },
    { idx: 9, edge_case: 'sibling_group_a_child2', scenario_tag: 'multi_child_parent', class_name: 'Grade 6', section: 'A', class_label: 'Grade 6-A' },
    { idx: 46, edge_case: 'sibling_group_a_child3', scenario_tag: 'multi_child_parent', class_name: 'Grade 9', section: 'A', class_label: 'Grade 9-A' },
    { idx: 22, edge_case: 'sibling_group_b_child1', scenario_tag: 'two_siblings_same_grade' },
    { idx: 23, edge_case: 'sibling_group_b_child2', scenario_tag: 'two_siblings_same_grade' },
    { idx: 11, edge_case: 'no_fees', fee_status: 'None', scenario_tag: 'fees_none' },
    { idx: 12, edge_case: 'all_fees_paid', fee_status: 'Paid', scenario_tag: 'fees_paid' },
    { idx: 13, edge_case: 'overdue_fees', fee_status: 'Overdue', scenario_tag: 'fees_overdue' },
    { idx: 14, edge_case: 'pending_utr', fee_status: 'Pending', scenario_tag: 'fees_pending' },
    { idx: 15, edge_case: 'transport_fee_only', fee_status: 'Unpaid', scenario_tag: 'fees_transport_only' },
    { idx: 24, edge_case: 'chronic_absent', attendance_pct: 62, scenario_tag: 'attendance_low' },
    { idx: 25, edge_case: 'perfect_attendance', attendance_pct: 100, scenario_tag: 'attendance_perfect' },
    { idx: 26, edge_case: 'weak_math', math_mark: 38, science_mark: 72, english_mark: 70, scenario_tag: 'marks_struggle' },
    { idx: 27, edge_case: 'topper', math_mark: 96, science_mark: 94, english_mark: 92, scenario_tag: 'marks_excellent' },
    { idx: 28, edge_case: 'homework_pressure', scenario_tag: 'homework_incomplete' },
    { idx: 30, edge_case: 'unlinked_no_parent', scenario_tag: 'no_parent_link' },
    { idx: 31, edge_case: 'parent_no_student_login', scenario_tag: 'parent_only_login' },
    { idx: 32, display_name: 'కృష్ణ రెడ్డి', edge_case: 'telugu_script_name', scenario_tag: 'i18n_name' },
    { idx: 33, display_name: 'अनिका शर्मा', edge_case: 'hindi_script_name', scenario_tag: 'i18n_name' },
    { idx: 40, edge_case: 'gk_quiz_champion', scenario_tag: 'student_gk_quiz' },
    { idx: 41, edge_case: 'competition_enrolled', scenario_tag: 'student_competition' },
    { idx: 42, edge_case: 'confidential_docs', scenario_tag: 'student_vault' },
    { idx: 48, edge_case: 'bus_tracker_demo', bus_route: 'Route A', scenario_tag: 'parent_transport' },
    { idx: 50, display_name: 'Zara Khan', edge_case: 'last_roster_row', scenario_tag: 'roster_end' },
  ]

  for (const e of edges) {
    const s = students.find((x) => x.idx === e.idx)
    if (!s) continue
    Object.assign(s, e)
    if (e.display_name) s.display_name = e.display_name
    if (e.class_name && e.section !== undefined) {
      s.class_label = e.section ? `${e.class_name}-${e.section}` : e.class_name
    }
  }

  // Assign class teachers (by primary focus)
  const classTeacherMap = {
    'Grade 5-A': 'Mrs. Kavitha Reddy',
    'Grade 6-A': 'Ms. Fatima Khan',
    'Grade 7-A': 'Mr. Arun Menon',
    'Grade 8-A': 'Mrs. Kavitha Reddy',
    'Grade 8-B': 'Mrs. Anjali Deshmukh',
    'Grade 9-A': 'Mr. Suresh Pillai',
    'Grade 5': 'Mrs. Kavitha Reddy',
  }
  for (const s of students) {
    s.class_teacher = classTeacherMap[s.class_label] || classTeacherMap[`${s.class_name}-${s.section}`] || 'Mrs. Kavitha Reddy'
  }

  return students
}

function makeParents(students) {
  const parents = []
  const links = []
  let p = 1
  const claimed = new Set()

  const siblingGroups = [
    {
      name: 'Suresh Rao',
      childIdx: [21, 9, 46],
      edge: 'three_siblings',
      demo_script: 'Parent switcher with 3 children across Grade 8-A, 6-A, 9-A',
    },
    {
      name: 'Lakshmi Iyer',
      childIdx: [22, 23],
      edge: 'two_siblings_same_grade',
      demo_script: 'Two children in Grade 8-A — switcher + shared fee view',
    },
  ]

  for (const g of siblingGroups) {
    const email = `parent${String(p).padStart(3, '0')}@${DOMAIN}`
    parents.push({
      idx: p,
      provisional_id: parentId(p),
      display_name: g.name,
      email,
      phone: `+9198${String(11000000 + p).slice(0, 8)}`,
      edge_case: g.edge,
      password: PASSWORD,
      demo_script: g.demo_script,
      children_count: g.childIdx.length,
    })
    for (const c of g.childIdx) {
      links.push({
        parent_email: email,
        student_id: studentId(c),
        student_idx: c,
        student_name: students.find((s) => s.idx === c)?.display_name || '',
        relationship: 'guardian',
        edge_case: g.edge,
      })
      claimed.add(c)
    }
    p += 1
  }

  for (const s of students) {
    if (claimed.has(s.idx)) continue
    if (s.edge_case === 'unlinked_no_parent') continue

    const email = `parent${String(p).padStart(3, '0')}@${DOMAIN}`
    const last = s.display_name.split(/\s+/).slice(-1)[0] || 'Guardian'
    const edge =
      s.edge_case === 'parent_no_student_login' ? 'parent_no_student_login' : 'single_child'
    parents.push({
      idx: p,
      provisional_id: parentId(p),
      display_name: `${last} Guardian`,
      email,
      phone: `+9198${String(22000000 + p).slice(0, 8)}`,
      edge_case: edge,
      password: PASSWORD,
      demo_script:
        edge === 'parent_no_student_login'
          ? 'Parent can log in; student has no login (parent_only_login)'
          : `Guardian of ${s.display_name} · ${s.class_label}`,
      children_count: 1,
    })
    links.push({
      parent_email: email,
      student_id: s.id,
      student_idx: s.idx,
      student_name: s.display_name,
      relationship: s.idx % 7 === 0 ? 'father' : s.idx % 5 === 0 ? 'mother' : 'guardian',
      edge_case: edge,
    })
    p += 1
  }

  return { parents, links }
}

function makeTeachers() {
  return [
    {
      idx: 1,
      email: `teacher01@${DOMAIN}`,
      display_name: 'Mrs. Kavitha Reddy',
      subject: 'Mathematics',
      classes: 'Grade 8-A|Grade 5-A|Grade 8-B',
      class_focus: 'Grade 8-A',
      password: PASSWORD,
      demo_script: 'Multi-class switcher · Message Parents · Marks · Attendance for 8-A',
      employee_id: 'T-1001',
    },
    {
      idx: 2,
      email: `teacher02@${DOMAIN}`,
      display_name: 'Mr. Arun Menon',
      subject: 'Science',
      classes: 'Grade 7-A|Grade 8-A',
      class_focus: 'Grade 7-A',
      password: PASSWORD,
      demo_script: 'Science homework · Paper scan · Syllabus notes',
      employee_id: 'T-1002',
    },
    {
      idx: 3,
      email: `teacher03@${DOMAIN}`,
      display_name: 'Ms. Fatima Khan',
      subject: 'English',
      classes: 'Grade 6-A|Grade 5-A',
      class_focus: 'Grade 6-A',
      password: PASSWORD,
      demo_script: 'English class · Leave request · Parent messaging',
      employee_id: 'T-1003',
    },
    {
      idx: 4,
      email: `teacher04@${DOMAIN}`,
      display_name: 'Mr. Suresh Pillai',
      subject: 'Social Studies',
      classes: 'Grade 9-A|Grade 8-A',
      class_focus: 'Grade 9-A',
      password: PASSWORD,
      demo_script: 'Grade 9 focus · Achievements / profile vault',
      employee_id: 'T-1004',
    },
    {
      idx: 5,
      email: `teacher05@${DOMAIN}`,
      display_name: 'Mrs. Anjali Deshmukh',
      subject: 'Class Teacher',
      classes: 'Grade 8-B|Grade 7-A',
      class_focus: 'Grade 8-B',
      password: PASSWORD,
      demo_script: 'Class teacher 8-B · Switch to 7-A · Secure folder',
      employee_id: 'T-1005',
    },
  ]
}

function makeTimetable() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const slots = [
    { period: 1, start: '09:00', end: '09:45' },
    { period: 2, start: '09:50', end: '10:35' },
    { period: 3, start: '10:50', end: '11:35' },
    { period: 4, start: '11:40', end: '12:25' },
    { period: 5, start: '13:15', end: '14:00' },
  ]
  const subjectsByClass = {
    'Grade 5-A': ['English', 'Math', 'EVS', 'Telugu', 'Art'],
    'Grade 6-A': ['English', 'Math', 'Science', 'Social', 'Telugu'],
    'Grade 7-A': ['English', 'Math', 'Science', 'Social', 'Computer'],
    'Grade 8-A': ['English', 'Math', 'Science', 'Social', 'Computer'],
    'Grade 8-B': ['English', 'Math', 'Science', 'Social', 'PE'],
    'Grade 9-A': ['English', 'Math', 'Physics', 'Chemistry', 'Social'],
  }
  const teacherBySubject = {
    Mathematics: 'Mrs. Kavitha Reddy',
    Math: 'Mrs. Kavitha Reddy',
    Science: 'Mr. Arun Menon',
    Physics: 'Mr. Arun Menon',
    Chemistry: 'Mr. Arun Menon',
    English: 'Ms. Fatima Khan',
    Social: 'Mr. Suresh Pillai',
    'Social Studies': 'Mr. Suresh Pillai',
    EVS: 'Ms. Fatima Khan',
    Telugu: 'Ms. Fatima Khan',
    Computer: 'Mrs. Anjali Deshmukh',
    Art: 'Mrs. Anjali Deshmukh',
    PE: 'Mrs. Anjali Deshmukh',
  }

  const rows = []
  for (const [cls, subjects] of Object.entries(subjectsByClass)) {
    for (const day of days) {
      slots.forEach((slot, i) => {
        const subject = subjects[i % subjects.length]
        rows.push({
          class_label: cls,
          day,
          period: slot.period,
          start: slot.start,
          end: slot.end,
          subject,
          teacher: teacherBySubject[subject] || 'Mrs. Kavitha Reddy',
          room: `R-${cls.replace(/\D/g, '')}${slot.period}`,
        })
      })
    }
  }
  return rows
}

function makeFees(students) {
  const rows = []
  for (const s of students) {
    if (s.edge_case === 'no_fees') continue
    if (s.edge_case === 'transport_fee_only') {
      rows.push({
        student_id: s.id,
        student_idx: s.idx,
        student_name: s.display_name,
        name: 'Transport — Quarterly',
        amount_rupees: 6000,
        status: 'Unpaid',
        category: 'Transport',
      })
      continue
    }
    const tuitionStatus =
      s.edge_case === 'all_fees_paid'
        ? 'Paid'
        : s.edge_case === 'overdue_fees'
          ? 'Overdue'
          : s.edge_case === 'pending_utr'
            ? 'Pending'
            : s.fee_status === 'Paid'
              ? 'Paid'
              : s.fee_status === 'Overdue'
                ? 'Overdue'
                : 'Unpaid'
    rows.push({
      student_id: s.id,
      student_idx: s.idx,
      student_name: s.display_name,
      name: 'Tuition — Term 1',
      amount_rupees: 18500,
      status: tuitionStatus,
      category: 'Tuition',
    })
    rows.push({
      student_id: s.id,
      student_idx: s.idx,
      student_name: s.display_name,
      name: 'Lab & Activity',
      amount_rupees: 4500,
      status: s.edge_case === 'all_fees_paid' ? 'Paid' : s.idx % 5 === 0 ? 'Paid' : 'Unpaid',
      category: 'Lab',
    })
  }
  return rows
}

function makeScenarios(students, parents, teachers, links) {
  const byIdx = Object.fromEntries(students.map((s) => [s.idx, s]))
  const parentByEmail = Object.fromEntries(parents.map((p) => [p.email, p]))

  const rows = [
    {
      order: 1,
      role: 'school',
      persona: 'School Admin',
      email: `admin@${DOMAIN}`,
      password: PASSWORD,
      student_idx: '',
      feature: 'School Dashboard',
      what_to_show: 'Roster health, fees overview, broadcasts, hiring, fleet',
      expected: 'Admin can see whole-school pulse and drill into Fee Auditor / Roster',
      edge_case: 'school_full_access',
    },
    {
      order: 2,
      role: 'school',
      persona: 'School Admin',
      email: `admin@${DOMAIN}`,
      password: PASSWORD,
      student_idx: 13,
      feature: 'Fee Auditor — Overdue',
      what_to_show: `Open fees for ${byIdx[13].display_name} (overdue)`,
      expected: 'Overdue tuition visible; can filter unpaid / overdue',
      edge_case: 'overdue_fees',
    },
    {
      order: 3,
      role: 'teacher',
      persona: teachers[0].display_name,
      email: teachers[0].email,
      password: PASSWORD,
      student_idx: '',
      feature: 'Multi-class switcher',
      what_to_show: 'Switch Grade 8-A → 5-A → 8-B in sidebar',
      expected: 'Roster / attendance context follows active class',
      edge_case: 'teacher_multi_class',
    },
    {
      order: 4,
      role: 'teacher',
      persona: teachers[0].display_name,
      email: teachers[0].email,
      password: PASSWORD,
      student_idx: 24,
      feature: 'Attendance — chronic absent',
      what_to_show: `Mark / review ${byIdx[24].display_name} (low attendance scenario)`,
      expected: 'Parent gets attendance alert when marked absent',
      edge_case: 'chronic_absent',
    },
    {
      order: 5,
      role: 'teacher',
      persona: teachers[0].display_name,
      email: teachers[0].email,
      password: PASSWORD,
      student_idx: 26,
      feature: 'Message Parents',
      what_to_show: `Search ${byIdx[26].display_name}, send note about weak Math`,
      expected: 'Parent + student notifications appear',
      edge_case: 'weak_math',
    },
    {
      order: 6,
      role: 'teacher',
      persona: teachers[0].display_name,
      email: teachers[0].email,
      password: PASSWORD,
      student_idx: '',
      feature: 'Teacher Profile + Secure folder',
      what_to_show: 'Open profile from sidebar · upload a sample PDF to vault',
      expected: 'Subjects/classes/quals editable; private vault owner-only',
      edge_case: 'teacher_profile_vault',
    },
    {
      order: 7,
      role: 'teacher',
      persona: teachers[1].display_name,
      email: teachers[1].email,
      password: PASSWORD,
      student_idx: '',
      feature: 'Homework + Syllabus',
      what_to_show: 'Assign homework for Grade 7-A; upload syllabus notes',
      expected: 'Students/parents in that class see homework',
      edge_case: 'teacher_homework',
    },
    {
      order: 8,
      role: 'parent',
      persona: parentByEmail[`parent001@${DOMAIN}`].display_name,
      email: `parent001@${DOMAIN}`,
      password: PASSWORD,
      student_idx: '21|9|46',
      feature: 'Multi-child switcher',
      what_to_show: 'Switch between 3 children across grades',
      expected: 'Dashboard / fees / attendance follow selected child',
      edge_case: 'three_siblings',
    },
    {
      order: 9,
      role: 'parent',
      persona: parents.find((p) => p.edge_case === 'single_child' && links.some((l) => l.parent_email === p.email && l.student_idx === 13))?.display_name || 'Overdue Guardian',
      email: links.find((l) => l.student_idx === 13)?.parent_email || '',
      password: PASSWORD,
      student_idx: 13,
      feature: 'Payments — Overdue',
      what_to_show: 'Open Payments · see overdue tuition',
      expected: 'Amount + UPI / Razorpay path; history empty or prior paid lines',
      edge_case: 'overdue_fees',
    },
    {
      order: 10,
      role: 'parent',
      persona: 'Transport demo parent',
      email: links.find((l) => l.student_idx === 48)?.parent_email || '',
      password: PASSWORD,
      student_idx: 48,
      feature: 'Bus tracker',
      what_to_show: 'Open Transport for bus-route student',
      expected: 'Route / ETA demo surfaces',
      edge_case: 'bus_tracker_demo',
    },
    {
      order: 11,
      role: 'student',
      persona: byIdx[40].display_name,
      email: `student040@${DOMAIN}`,
      password: PASSWORD,
      student_idx: 40,
      feature: 'GK Quiz',
      what_to_show: 'Learn → GK Quiz · Easy full list · submit · green/red review',
      expected: 'All levels open; score + review after submit',
      edge_case: 'gk_quiz_champion',
    },
    {
      order: 12,
      role: 'student',
      persona: byIdx[41].display_name,
      email: `student041@${DOMAIN}`,
      password: PASSWORD,
      student_idx: 41,
      feature: 'Competitions',
      what_to_show: 'Register / pay flow for a competition',
      expected: 'Enrollment reflects on Academic Profile competitions loop',
      edge_case: 'competition_enrolled',
    },
    {
      order: 13,
      role: 'student',
      persona: byIdx[42].display_name,
      email: `student042@${DOMAIN}`,
      password: PASSWORD,
      student_idx: 42,
      feature: 'Confidential Documents',
      what_to_show: 'Profile → upload birth certificate / report card',
      expected: 'Private vault; open via signed/local URL only',
      edge_case: 'confidential_docs',
    },
    {
      order: 14,
      role: 'student',
      persona: byIdx[27].display_name,
      email: `student027@${DOMAIN}`,
      password: PASSWORD,
      student_idx: 27,
      feature: 'Academics / Achievements',
      what_to_show: 'Strong marks student · progress + badges',
      expected: 'High marks story; achievements panel populated',
      edge_case: 'topper',
    },
    {
      order: 15,
      role: 'student',
      persona: byIdx[28].display_name,
      email: `student028@${DOMAIN}`,
      password: PASSWORD,
      student_idx: 28,
      feature: 'Homework reminders',
      what_to_show: 'Home priority tasks · start / complete homework',
      expected: 'XP + toast; parent can see completion signal',
      edge_case: 'homework_pressure',
    },
    {
      order: 16,
      role: 'student',
      persona: byIdx[32].display_name,
      email: `student032@${DOMAIN}`,
      password: PASSWORD,
      student_idx: 32,
      feature: 'Telugu UI name',
      what_to_show: 'Login · toggle language TE · verify name renders',
      expected: 'Unicode name + Telugu chrome OK',
      edge_case: 'telugu_script_name',
    },
    {
      order: 17,
      role: 'parent',
      persona: parents.find((p) => p.edge_case === 'parent_no_student_login')?.display_name || '',
      email: parents.find((p) => p.edge_case === 'parent_no_student_login')?.email || '',
      password: PASSWORD,
      student_idx: 31,
      feature: 'Parent-only login',
      what_to_show: 'Parent logs in; student031 has NO student login',
      expected: 'Parent sees child data; student email does not authenticate',
      edge_case: 'parent_no_student_login',
    },
    {
      order: 18,
      role: 'school',
      persona: 'School Admin',
      email: `admin@${DOMAIN}`,
      password: PASSWORD,
      student_idx: 30,
      feature: 'Unlinked student',
      what_to_show: `${byIdx[30].display_name} on roster with no parent link`,
      expected: 'School can still manage attendance/fees; no parent alert target',
      edge_case: 'unlinked_no_parent',
    },
  ]

  return rows
}

function makeLogins(teachers, parents, students) {
  const rows = [
    {
      role: 'school',
      email: `admin@${DOMAIN}`,
      password: PASSWORD,
      display_name: 'Sunrise Demo Admin',
      notes: 'Full school suite · DEMO50',
      student_id: '',
      class_label: '',
      demo_priority: 'P0',
    },
  ]
  for (const t of teachers) {
    rows.push({
      role: 'teacher',
      email: t.email,
      password: PASSWORD,
      display_name: t.display_name,
      notes: `${t.subject} · classes: ${t.classes}`,
      student_id: '',
      class_label: t.class_focus,
      demo_priority: t.idx === 1 ? 'P0' : 'P1',
    })
  }
  for (const p of parents) {
    rows.push({
      role: 'parent',
      email: p.email,
      password: PASSWORD,
      display_name: p.display_name,
      notes: p.edge_case,
      student_id: '',
      class_label: '',
      demo_priority: p.idx <= 2 ? 'P0' : 'P2',
    })
  }
  for (const s of students) {
    if (s.edge_case === 'parent_no_student_login') continue
    rows.push({
      role: 'student',
      email: `student${String(s.idx).padStart(3, '0')}@${DOMAIN}`,
      password: PASSWORD,
      display_name: s.display_name,
      notes: `roll ${s.roll_no} · ${s.class_label} · ${s.edge_case}`,
      student_id: s.id,
      class_label: s.class_label,
      demo_priority: [40, 41, 42, 27, 28, 32].includes(s.idx) ? 'P0' : 'P2',
    })
  }
  return rows
}

function makeQuickStart() {
  return [
    {
      step: 1,
      role: 'school',
      email: `admin@${DOMAIN}`,
      password: PASSWORD,
      open_first: 'Dashboard → Fee Auditor → Roster',
      talk_track: 'Whole-school ops in one admin desk',
    },
    {
      step: 2,
      role: 'teacher',
      email: `teacher01@${DOMAIN}`,
      password: PASSWORD,
      open_first: 'Class switcher → Attendance → Message Parents → Profile',
      talk_track: 'Teacher handles many classes without losing context',
    },
    {
      step: 3,
      role: 'parent',
      email: `parent001@${DOMAIN}`,
      password: PASSWORD,
      open_first: 'Child switcher → Payments → Alerts',
      talk_track: 'One parent, three children, clear money + attendance story',
    },
    {
      step: 4,
      role: 'student',
      email: `student040@${DOMAIN}`,
      password: PASSWORD,
      open_first: 'Home → GK Quiz → Competitions → Profile vault',
      talk_track: 'Companion that is more than ERP — learning + identity',
    },
  ]
}

async function writeXlsx(sheets) {
  const require = createRequire(import.meta.url)
  let XLSX
  try {
    XLSX = require('xlsx')
  } catch {
    throw new Error('Missing dependency `xlsx`. Run: npm install -D xlsx')
  }

  const wb = XLSX.utils.book_new()
  for (const [name, rows] of Object.entries(sheets)) {
    if (!rows.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['(empty)']]), name.slice(0, 31))
      continue
    }
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))
  }
  const xlsxPath = join(outDir, 'DEMO50_Client_Pack.xlsx')
  XLSX.writeFile(wb, xlsxPath)
  return xlsxPath
}

const students = makeStudents()
const { parents, links } = makeParents(students)
const teachers = makeTeachers()
const fees = makeFees(students)
const timetable = makeTimetable()
const logins = makeLogins(teachers, parents, students)
const scenarios = makeScenarios(students, parents, teachers, links)
const quickStart = makeQuickStart()

writeFileSync(
  join(outDir, 'students.csv'),
  toCsv(
    [
      'idx',
      'id',
      'display_name',
      'class_name',
      'section',
      'class_label',
      'roll_no',
      'edge_case',
      'scenario_tag',
      'gender_hint',
      'math_mark',
      'science_mark',
      'english_mark',
      'attendance_pct',
      'fee_status',
      'bus_route',
      'class_teacher',
    ],
    students,
  ),
)
writeFileSync(
  join(outDir, 'parents.csv'),
  toCsv(
    [
      'idx',
      'provisional_id',
      'display_name',
      'email',
      'phone',
      'edge_case',
      'password',
      'children_count',
      'demo_script',
    ],
    parents,
  ),
)
writeFileSync(
  join(outDir, 'parent_child_links.csv'),
  toCsv(
    ['parent_email', 'student_id', 'student_idx', 'student_name', 'relationship', 'edge_case'],
    links,
  ),
)
writeFileSync(
  join(outDir, 'teachers.csv'),
  toCsv(
    [
      'idx',
      'email',
      'display_name',
      'subject',
      'classes',
      'class_focus',
      'password',
      'employee_id',
      'demo_script',
    ],
    teachers,
  ),
)
writeFileSync(
  join(outDir, 'fees.csv'),
  toCsv(
    ['student_id', 'student_idx', 'student_name', 'name', 'amount_rupees', 'status', 'category'],
    fees,
  ),
)
writeFileSync(
  join(outDir, 'timetable.csv'),
  toCsv(['class_label', 'day', 'period', 'start', 'end', 'subject', 'teacher', 'room'], timetable),
)
writeFileSync(
  join(outDir, 'login_directory.csv'),
  toCsv(
    ['role', 'email', 'password', 'display_name', 'notes', 'student_id', 'class_label', 'demo_priority'],
    logins,
  ),
)
writeFileSync(
  join(outDir, 'demo_scenarios.csv'),
  toCsv(
    [
      'order',
      'role',
      'persona',
      'email',
      'password',
      'student_idx',
      'feature',
      'what_to_show',
      'expected',
      'edge_case',
    ],
    scenarios,
  ),
)
writeFileSync(
  join(outDir, 'quick_start.csv'),
  toCsv(['step', 'role', 'email', 'password', 'open_first', 'talk_track'], quickStart),
)

writeFileSync(
  join(outDir, 'manifest.json'),
  JSON.stringify(
    {
      school: SCHOOL,
      password: PASSWORD,
      domain: DOMAIN,
      counts: {
        students: students.length,
        parents: parents.length,
        teachers: teachers.length,
        fees: fees.length,
        logins: logins.length,
        links: links.length,
        timetableRows: timetable.length,
        scenarios: scenarios.length,
      },
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
)

const edgeMd = `# DEMO50 edge cases & attributed scenarios

School: **${SCHOOL.name}** (\`${SCHOOL.code}\`)  
Shared password: \`${PASSWORD}\`  
Domain: \`@${DOMAIN}\`

## Students with special scenarios

| idx | Name | Class | Edge case | Demo tag |
|--|--|--|--|--|
${students
  .filter((s) => s.edge_case && s.edge_case !== 'standard')
  .map(
    (s) =>
      `| ${s.idx} | ${s.display_name} | ${s.class_label} | \`${s.edge_case}\` | \`${s.scenario_tag || ''}\` |`,
  )
  .join('\n')}

## Sibling groups
- **parent001** (${parents[0].display_name}): students 21, 9, 46 (3 children)
- **parent002** (${parents[1].display_name}): students 22, 23 (same grade)

## Unlinked / auth exceptions
- Student **30**: roster only, no parent link
- Student **31**: parent login only (no student031 login)

## Teachers
${teachers.map((t) => `- **${t.display_name}** (\`${t.email}\`) — ${t.classes}`).join('\n')}
`

writeFileSync(join(outDir, 'EDGE_CASES.md'), edgeMd)

const readme = `# DEMO50 — Client review school pack

**Sunrise Demo Academy** — a complete 50-student onboarding dataset for school demos.

| Field | Value |
|--|--|
| School | ${SCHOOL.name} |
| Code | \`${SCHOOL.code}\` |
| City | ${SCHOOL.city} |
| Shared password | \`${PASSWORD}\` |
| Email domain | \`@${DOMAIN}\` |
| Academic year | ${SCHOOL.academicYear} |

## Master workbook

Open **\`DEMO50_Client_Pack.xlsx\`** — sheets:

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
| Students | ${students.length} |
| Parents | ${parents.length} |
| Teachers | ${teachers.length} |
| School admins | 1 |
| Fee lines | ${fees.length} |
| Auth logins | ${logins.length} |
| Parent↔child links | ${links.length} |
| Timetable rows | ${timetable.length} |

## Headline credentials (memorize these four)

| Role | Email | Password |
|--|--|--|
| School | \`admin@${DOMAIN}\` | \`${PASSWORD}\` |
| Teacher (lead) | \`teacher01@${DOMAIN}\` | \`${PASSWORD}\` |
| Parent (3 kids) | \`parent001@${DOMAIN}\` | \`${PASSWORD}\` |
| Student (GK demo) | \`student040@${DOMAIN}\` | \`${PASSWORD}\` |

## How this maps to the product

| Sheet column / tag | Product surface |
|--|--|
| \`class_label\` + teacher \`classes\` | Teacher class switcher |
| \`fee_status\` / Fees sheet | Parent Payments + School Fee Auditor |
| \`attendance_pct\` / chronic_absent | Teacher Attendance + parent alerts |
| \`math_mark\` etc. | Teacher Marks + Academics |
| Timetable sheet | Student schedule / school timetable |
| \`confidential_docs\` / teacher vault | Profile secure folders |
| \`gk_quiz_champion\` | Student GK Quiz module |
| \`competition_enrolled\` | Competitions → profile loop |
| Sibling parents | Parent child switcher |

## Regenerate

\`\`\`bash
npm run demo50:generate
\`\`\`

## Note on live Supabase

This pack is the **source of truth for the client meeting**.  
Existing live pilot data may still be \`PILOT100\` — use this workbook for credentials storytelling even if you demo on local/demo auth, or provision DEMO50 separately when ready.
`

writeFileSync(join(outDir, 'README.md'), readme)

const xlsxPath = await writeXlsx({
  Quick_Start: quickStart,
  Login_Directory: logins,
  Students: students,
  Parents: parents,
  Parent_Child_Links: links,
  Teachers: teachers,
  Fees: fees,
  Timetable: timetable,
  Demo_Scenarios: scenarios,
})

console.log('DEMO50 written to', outDir)
console.log('Workbook:', xlsxPath)
console.log(
  JSON.stringify(
    {
      students: students.length,
      parents: parents.length,
      teachers: teachers.length,
      fees: fees.length,
      logins: logins.length,
      scenarios: scenarios.length,
    },
    null,
    2,
  ),
)
