#!/usr/bin/env node
/**
 * Generates PILOT100 fixture CSVs + SQL seed for a disposable 100-student test school.
 * Run: node scripts/generate-pilot100.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')
const outDir = join(root, 'fixtures', 'pilot100')
mkdirSync(outDir, { recursive: true })

const SCHOOL = {
  code: 'PILOT100',
  name: 'Orbit Pilot Academy',
  upi: 'orbit.pilot100@oksbi',
}

const PASSWORD = 'Pilot100!'

const FIRST = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Aadhya', 'Diya', 'Myra', 'Saanvi', 'Pari', 'Anika', 'Kiara', 'Navya', 'Ira',
  'Rohan', 'Karthik', 'Nikhil', 'Rahul', 'Varun', 'Siddharth', 'Dev', 'Yash', 'Om', 'Kabir',
  'Priya', 'Sneha', 'Meera', 'Isha', 'Nisha', 'Pooja', 'Kavya', 'Riya', 'Tanvi', 'Shruti',
  'Lakshmi', 'Padma', 'Gayatri', 'Sita', 'Radha', 'Harini', 'Tejas', 'Ravi', 'Manoj', 'Pranav',
]

const LAST = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Menon', 'Gupta', 'Singh', 'Khan',
  'Das', 'Banerjee', 'Mukherjee', 'Choudhary', 'Joshi', 'Mehta', 'Kapoor', 'Malhotra', 'Rao', 'Naidu',
  'Pillai', 'Shetty', 'Hegde', 'Kulkarni', 'Deshmukh', 'Jain', 'Agarwal', 'Bose', 'Sen', 'Dutta',
]

function csvEscape(v) {
  const s = v == null ? '' : String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(headers, rows) {
  return [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\n') + '\n'
}

function studentId(n) {
  return `b1000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

function parentId(n) {
  return `b2000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

/** Deterministic “UUID-like” ids for seed SQL (students/parents are not auth ids). */
function makeStudents() {
  const classes = [
    { class_name: 'Grade 6', section: 'A', count: 18 },
    { class_name: 'Grade 6', section: 'B', count: 16 },
    { class_name: 'Grade 7', section: 'A', count: 18 },
    { class_name: 'Grade 8', section: 'A', count: 20 },
    { class_name: 'Grade 8', section: 'B', count: 16 },
    { class_name: 'Grade 9', section: 'A', count: 12 },
  ]

  const students = []
  let n = 1
  for (const cls of classes) {
    for (let i = 1; i <= cls.count; i++) {
      const first = FIRST[(n + i) % FIRST.length]
      const last = LAST[(n * 3 + i) % LAST.length]
      students.push({
        idx: n,
        id: studentId(n),
        display_name: `${first} ${last}`,
        class_name: cls.class_name,
        section: cls.section,
        roll_no: String(i).padStart(2, '0'),
        edge_case: '',
        gender_hint: n % 2 === 0 ? 'F' : 'M',
      })
      n += 1
    }
  }

  // Edge cases overwrite specific slots
  const edges = [
    { idx: 1, display_name: "Aarav D'Souza", edge_case: 'apostrophe_surname' },
    { idx: 2, display_name: 'Mary-Anne Joseph', edge_case: 'hyphenated_given' },
    { idx: 3, display_name: 'Muhammad Ibrahim Al-Hassan', edge_case: 'long_multi_part_name' },
    { idx: 4, display_name: 'Chinnu', edge_case: 'single_word_name', section: 'A' },
    { idx: 5, display_name: '  Spaced  Name  Test  ', edge_case: 'leading_trailing_spaces' },
    { idx: 6, display_name: 'Ñisha O\'Brien', edge_case: 'unicode_and_escape' },
    { idx: 7, section: '', edge_case: 'empty_section' },
    { idx: 8, roll_no: '99', edge_case: 'non_sequential_roll' },
    { idx: 9, roll_no: '7', edge_case: 'roll_without_leading_zero' },
    { idx: 10, display_name: 'Priya Sharma', edge_case: 'duplicate_common_name_a' },
    { idx: 55, display_name: 'Priya Sharma', edge_case: 'duplicate_common_name_b' },
    { idx: 11, class_name: 'Grade 8', section: 'A', edge_case: 'sibling_group_a_child1' },
    { idx: 12, class_name: 'Grade 6', section: 'A', edge_case: 'sibling_group_a_child2' },
    { idx: 13, class_name: 'Grade 9', section: 'A', edge_case: 'sibling_group_a_child3' },
    { idx: 21, class_name: 'Grade 7', section: 'A', edge_case: 'sibling_group_b_child1' },
    { idx: 22, class_name: 'Grade 7', section: 'A', edge_case: 'sibling_group_b_child2' },
    { idx: 30, edge_case: 'no_fees' },
    { idx: 31, edge_case: 'all_fees_paid' },
    { idx: 32, edge_case: 'overdue_fees' },
    { idx: 33, edge_case: 'pending_utr' },
    { idx: 40, edge_case: 'chronic_absent' },
    { idx: 41, edge_case: 'perfect_attendance' },
    { idx: 50, edge_case: 'unlinked_no_parent' },
    { idx: 51, edge_case: 'student_login_only' },
    { idx: 60, edge_case: 'parent_no_student_login' },
    { idx: 70, display_name: 'కృష్ణ రెడ్డి', edge_case: 'telugu_script_name' },
    { idx: 71, display_name: 'अनिका शर्मा', edge_case: 'hindi_script_name' },
    { idx: 80, edge_case: 'transport_fee_only' },
    { idx: 90, class_name: 'Grade 10', section: 'A', edge_case: 'class_outside_main_policy' },
    { idx: 100, display_name: 'Zara Khan', edge_case: 'last_roster_row' },
  ]

  for (const e of edges) {
    const s = students.find((x) => x.idx === e.idx)
    if (!s) continue
    Object.assign(s, e)
    if (e.display_name) s.display_name = e.display_name.trim().replace(/\s+/g, ' ')
    if (e.idx === 5) s.display_name = 'Spaced Name Test'
  }

  return students
}

function makeParents(students) {
  const parents = []
  const links = []
  let p = 1

  const siblingGroups = [
    { parentIdx: null, childIdx: [11, 12, 13], name: 'Suresh Rao', edge: 'three_siblings' },
    { parentIdx: null, childIdx: [21, 22], name: 'Lakshmi Iyer', edge: 'two_siblings_same_class' },
  ]

  const claimed = new Set()

  for (const g of siblingGroups) {
    const id = parentId(p)
    const email = `parent${String(p).padStart(3, '0')}@pilot100.orbit.app`
    parents.push({
      idx: p,
      provisional_id: id,
      display_name: g.name,
      email,
      phone: `+9198${String(10000000 + p).slice(0, 8)}`,
      edge_case: g.edge,
      password: PASSWORD,
    })
    for (const c of g.childIdx) {
      links.push({
        parent_email: email,
        student_id: studentId(c),
        student_idx: c,
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

    const id = parentId(p)
    const email = `parent${String(p).padStart(3, '0')}@pilot100.orbit.app`
    const last = s.display_name.split(' ').slice(-1)[0] || 'Guardian'
    parents.push({
      idx: p,
      provisional_id: id,
      display_name: `${last} Guardian`,
      email,
      phone: `+9198${String(20000000 + p).slice(0, 8)}`,
      edge_case: s.edge_case === 'parent_no_student_login' ? 'parent_no_student_login' : 'single_child',
      password: PASSWORD,
    })
    links.push({
      parent_email: email,
      student_id: s.id,
      student_idx: s.idx,
      relationship: s.idx % 7 === 0 ? 'father' : s.idx % 5 === 0 ? 'mother' : 'guardian',
      edge_case: s.edge_case || 'single_child',
    })
    p += 1
  }

  return { parents, links }
}

function makeTeachers() {
  return [
    { idx: 1, email: 'teacher01@pilot100.orbit.app', display_name: 'Mrs. Kavitha Reddy', subject: 'Mathematics', class_focus: 'Grade 8-A', password: PASSWORD },
    { idx: 2, email: 'teacher02@pilot100.orbit.app', display_name: 'Mr. Arun Menon', subject: 'Science', class_focus: 'Grade 7-A', password: PASSWORD },
    { idx: 3, email: 'teacher03@pilot100.orbit.app', display_name: 'Ms. Fatima Khan', subject: 'English', class_focus: 'Grade 6-A', password: PASSWORD },
    { idx: 4, email: 'teacher04@pilot100.orbit.app', display_name: 'Mr. Suresh Pillai', subject: 'Social Studies', class_focus: 'Grade 9-A', password: PASSWORD },
    { idx: 5, email: 'teacher05@pilot100.orbit.app', display_name: 'Mrs. Anjali Deshmukh', subject: 'Class Teacher', class_focus: 'Grade 8-B', password: PASSWORD },
  ]
}

function makeFees(students) {
  const rows = []
  for (const s of students) {
    if (s.edge_case === 'no_fees') continue
    if (s.edge_case === 'transport_fee_only') {
      rows.push({
        student_id: s.id,
        student_idx: s.idx,
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
            : s.idx % 4 === 0
              ? 'Paid'
              : 'Unpaid'
    rows.push({
      student_id: s.id,
      student_idx: s.idx,
      name: 'Tuition — Term 1',
      amount_rupees: 18500,
      status: tuitionStatus,
      category: 'Tuition',
    })
    rows.push({
      student_id: s.id,
      student_idx: s.idx,
      name: 'Lab & Activity',
      amount_rupees: 4500,
      status: s.edge_case === 'all_fees_paid' ? 'Paid' : s.idx % 5 === 0 ? 'Paid' : 'Unpaid',
      category: 'Lab',
    })
  }
  return rows
}

function makeLogins(teachers, parents, students) {
  const rows = [
    {
      role: 'school',
      email: 'admin@pilot100.orbit.app',
      password: PASSWORD,
      display_name: 'Pilot School Admin',
      notes: 'Full school suite access for PILOT100',
    },
  ]
  for (const t of teachers) {
    rows.push({
      role: 'teacher',
      email: t.email,
      password: PASSWORD,
      display_name: t.display_name,
      notes: `${t.subject} · ${t.class_focus}`,
    })
  }
  for (const p of parents) {
    rows.push({
      role: 'parent',
      email: p.email,
      password: PASSWORD,
      display_name: p.display_name,
      notes: p.edge_case,
    })
  }
  // Student logins for most kids except edge cases that skip
  for (const s of students) {
    if (s.edge_case === 'parent_no_student_login') continue
    if (s.edge_case === 'unlinked_no_parent' && s.idx !== 50) {
      /* still allow student login for unlinked */
    }
    rows.push({
      role: 'student',
      email: `student${String(s.idx).padStart(3, '0')}@pilot100.orbit.app`,
      password: PASSWORD,
      display_name: s.display_name,
      notes: `roll ${s.roll_no} · ${s.class_name}-${s.section || '?'} · ${s.edge_case || 'standard'}`,
      student_id: s.id,
    })
  }
  return rows
}

function sqlString(s) {
  return `'${String(s).replace(/'/g, "''")}'`
}

function buildSql(students, fees) {
  const studentValues = students
    .map(
      (s) =>
        `(${sqlString(s.id)}, sid, ${sqlString(s.class_name)}, ${s.section ? sqlString(s.section) : 'null'}, ${sqlString(s.roll_no)}, ${sqlString(s.display_name)})`,
    )
    .join(',\n    ')

  const feeValues = fees
    .map((f) => {
      const due =
        f.status === 'Overdue'
          ? `current_date - 10`
          : f.status === 'Paid'
            ? `current_date - 30`
            : `current_date + 14`
      return `(sid, ${sqlString(f.student_id)}, ${sqlString(f.name)}, ${f.amount_rupees * 100}, ${sqlString(f.status)}, ${sqlString(f.category)}, ${due})`
    })
    .join(',\n    ')

  // Sample attendance last 5 school days for edge cases + random-ish for others
  const attendanceChunks = []
  for (const s of students) {
    for (let d = 1; d <= 5; d++) {
      let status = 'Present'
      if (s.edge_case === 'chronic_absent') status = 'Absent'
      else if (s.edge_case === 'perfect_attendance') status = 'Present'
      else if ((s.idx + d) % 9 === 0) status = 'Absent'
      attendanceChunks.push(
        `(sid, ${sqlString(s.id)}, current_date - ${d}, ${sqlString(status)}, ${
          status === 'Absent' ? sqlString('Pilot seed absence') : 'null'
        })`,
      )
    }
  }

  return `-- PILOT100 disposable school seed (safe to re-run; delete via teardown script)
-- School code: ${SCHOOL.code}

do $$
declare
  sid uuid;
begin
  insert into public.schools (id, name, code)
  values ('c1000000-0000-4000-8000-000000000100', ${sqlString(SCHOOL.name)}, ${sqlString(SCHOOL.code)})
  on conflict (code) do update set name = excluded.name
  returning id into sid;

  select id into sid from public.schools where code = ${sqlString(SCHOOL.code)};

  delete from public.fee_items where school_id = sid;
  delete from public.attendance where school_id = sid;
  delete from public.homework_completions where homework_id in (select id from public.homework_tasks where school_id = sid);
  delete from public.homework_tasks where school_id = sid;
  delete from public.student_grades where school_id = sid;
  delete from public.parent_links where student_id in (select id from public.students where school_id = sid);
  delete from public.students where school_id = sid;
  delete from public.class_invites where school_id = sid;
  delete from public.school_policy where school_id = sid;
  delete from public.school_payment_settings where school_id = sid;
  delete from public.staff_directory where school_id = sid;
  delete from public.bus_routes where school_id = sid;
  delete from public.hiring_applications where school_id = sid;
  delete from public.extracurricular_requests where school_id = sid;
  delete from public.extracurricular_programs where school_id = sid;
  delete from public.class_timetable where school_id = sid;
  delete from public.broadcasts where school_id = sid;
  delete from public.calendar_events where school_id = sid;
  delete from public.leave_requests where school_id = sid;

  insert into public.students (id, school_id, class_name, section, roll_no, display_name)
  values
    ${studentValues}
  on conflict (id) do update set
    display_name = excluded.display_name,
    class_name = excluded.class_name,
    section = excluded.section,
    roll_no = excluded.roll_no,
    school_id = excluded.school_id;

  insert into public.school_payment_settings (school_id, upi_id, account_name, bank_name, ifsc, instructions)
  values (
    sid,
    ${sqlString(SCHOOL.upi)},
    ${sqlString(SCHOOL.name)},
    'State Bank of India',
    'SBIN0009999',
    'PILOT100 test school — pay via UPI then submit UTR. Disposable dataset.'
  )
  on conflict (school_id) do update set
    upi_id = excluded.upi_id,
    account_name = excluded.account_name,
    instructions = excluded.instructions,
    updated_at = now();

  insert into public.school_policy (school_id, active_class_label)
  values (sid, 'Grade 8-A')
  on conflict (school_id) do update set active_class_label = excluded.active_class_label;

  insert into public.fee_items (school_id, student_id, name, amount_paise, status, category, due_date)
  values
    ${feeValues};

  insert into public.attendance (school_id, student_id, date, status, reason)
  values
    ${attendanceChunks.join(',\n    ')}
  on conflict (student_id, date) do update set
    status = excluded.status,
    reason = excluded.reason;

  insert into public.homework_tasks (school_id, class_name, subject, task, due_label, xp, difficulty, completed)
  values
    (sid, 'Grade 8-A', 'Mathematics', 'PILOT: Complete exercise 4.2 Q1–Q10', 'Friday', 50, 'Medium', false),
    (sid, 'Grade 8-A', 'Science', 'PILOT: Draw plant cell diagram', 'Tomorrow', 40, 'Easy', false),
    (sid, 'Grade 7-A', 'Science', 'PILOT: Revise chapter notes', 'Monday', 30, 'Easy', false),
    (sid, 'Grade 6-A', 'English', 'PILOT: Write 1-page diary entry', 'Wednesday', 25, 'Easy', false);

  insert into public.student_grades (id, school_id, student_id, student_name, math, science, chem, comment)
  select
    gen_random_uuid(),
    sid,
    s.id,
    s.display_name,
    (60 + (coalesce(nullif(regexp_replace(coalesce(s.roll_no, ''), '[^0-9]', '', 'g'), '')::int, 0) % 35))::text,
    (55 + (coalesce(nullif(regexp_replace(coalesce(s.roll_no, ''), '[^0-9]', '', 'g'), '')::int, 0) % 40))::text,
    (50 + (coalesce(nullif(regexp_replace(coalesce(s.roll_no, ''), '[^0-9]', '', 'g'), '')::int, 0) % 45))::text,
    'PILOT100 seed marks'
  from public.students s
  where s.school_id = sid
    and s.class_name = 'Grade 8'
    and s.section = 'A';

  insert into public.staff_directory (id, school_id, display_name, subject_key, qualification, phone)
  values
    (gen_random_uuid(), sid, 'Mrs. Kavitha Reddy', 'Mathematics', 'M.Sc. Math, B.Ed', '+91 98XXXX1001'),
    (gen_random_uuid(), sid, 'Mr. Arun Menon', 'Science', 'M.Sc. Physics', '+91 98XXXX1002'),
    (gen_random_uuid(), sid, 'Ms. Fatima Khan', 'English', 'M.A. English, B.Ed', '+91 98XXXX1003');

  insert into public.bus_routes (id, school_id, name, route_label, driver_name, driver_phone, capacity, status, eta_text, last_updated_at)
  values
    ('pilot_bus_1', sid, 'Bus P1', 'Pilot Colony → Pilot Academy', 'Ramesh', '+91 98XXXX2001', '28/40', 'en_route', '~15 min', now()),
    ('pilot_bus_2', sid, 'Bus P2', 'Lake Road → Pilot Academy', 'Suresh', '+91 98XXXX2002', '20/40', 'idle', null, now() - interval '2 hours')
  on conflict (id) do update set school_id = excluded.school_id, status = excluded.status;

  insert into public.extracurricular_programs (school_id, category, title, coach, location, cost_label, phone)
  values
    (sid, 'sports', 'PILOT Football', 'Coach Vivek', 'Ground A', '₹1,000 / mo', '+91 98XXXX3001'),
    (sid, 'drawing', 'PILOT Art Club', 'Ms. Meera', 'Art room', '₹700 / mo', '+91 98XXXX3002');

  insert into public.hiring_applications (school_id, name, subject, experience, qualification, status)
  values
    (sid, 'Pilot Applicant One', 'Mathematics', '3 years', 'M.Sc.', 'Applied'),
    (sid, 'Pilot Applicant Two', 'English', '5 years', 'M.A. B.Ed', 'Interview Scheduled');

  insert into public.broadcasts (school_id, target, title, content)
  values (sid, 'Parents', 'Welcome to PILOT100', 'Disposable test school — safe to delete after QA.');

  insert into public.calendar_events (school_id, title, category, event_date)
  values (sid, 'PILOT Unit Test Week', 'Exams', to_char(current_date + 10, 'YYYY-MM-DD'));

  insert into public.class_invites (code, school_id, role, student_id, class_name, max_uses, active)
  values
    ('PILOT100-ADM', sid, 'school', null, null, 50, true),
    ('PILOT100-TCH', sid, 'teacher', null, 'Grade 8-A', 50, true),
    ('PILOT100-PAR', sid, 'parent', ${sqlString(studentId(1))}, 'Grade 6-A', 50, true),
    ('PILOT100-STU', sid, 'student', ${sqlString(studentId(1))}, 'Grade 6-A', 50, true)
  on conflict (code) do update set
    school_id = excluded.school_id,
    active = true,
    student_id = excluded.student_id;

  raise notice 'PILOT100 seeded. school_id=%', sid;
end $$;
`
}

const students = makeStudents()
const { parents, links } = makeParents(students)
const teachers = makeTeachers()
const fees = makeFees(students)
const logins = makeLogins(teachers, parents, students)

writeFileSync(
  join(outDir, 'students.csv'),
  toCsv(
    ['idx', 'id', 'display_name', 'class_name', 'section', 'roll_no', 'edge_case', 'gender_hint'],
    students,
  ),
)
writeFileSync(
  join(outDir, 'parents.csv'),
  toCsv(['idx', 'provisional_id', 'display_name', 'email', 'phone', 'edge_case', 'password'], parents),
)
writeFileSync(
  join(outDir, 'parent_child_links.csv'),
  toCsv(['parent_email', 'student_id', 'student_idx', 'relationship', 'edge_case'], links),
)
writeFileSync(
  join(outDir, 'teachers.csv'),
  toCsv(['idx', 'email', 'display_name', 'subject', 'class_focus', 'password'], teachers),
)
writeFileSync(
  join(outDir, 'fees.csv'),
  toCsv(['student_id', 'student_idx', 'name', 'amount_rupees', 'status', 'category'], fees),
)
writeFileSync(
  join(outDir, 'login_directory.csv'),
  toCsv(['role', 'email', 'password', 'display_name', 'notes', 'student_id'], logins),
)

writeFileSync(
  join(outDir, 'EDGE_CASES.md'),
  `# PILOT100 edge cases

School: **${SCHOOL.name}** (\`${SCHOOL.code}\`)  
Shared password: \`${PASSWORD}\`

| idx | Edge case | Why |
|--|--|--|
${students
  .filter((s) => s.edge_case)
  .map((s) => `| ${s.idx} | \`${s.edge_case}\` | ${s.display_name} · ${s.class_name}-${s.section || 'none'} |`)
  .join('\n')}

## Sibling groups
- Parent of students 11,12,13 (3 children across grades)
- Parent of students 21,22 (2 children same grade)

## Unlinked
- Student 50: roster only, no parent link

## Auth note
Run \`node scripts/provision-pilot100.mjs\` after SQL seed to create Auth users + profile links.
Teardown: \`node scripts/teardown-pilot100.mjs\`
`,
)

const sql = buildSql(students, fees)
writeFileSync(join(root, 'supabase', 'pilot100_seed.sql'), sql)

writeFileSync(
  join(outDir, 'manifest.json'),
  JSON.stringify(
    {
      school: SCHOOL,
      password: PASSWORD,
      counts: {
        students: students.length,
        parents: parents.length,
        teachers: teachers.length,
        fees: fees.length,
        logins: logins.length,
        links: links.length,
      },
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
)

console.log(`PILOT100 fixtures written to ${outDir}`)
console.log(JSON.stringify({ students: students.length, parents: parents.length, teachers: teachers.length, fees: fees.length, logins: logins.length }, null, 2))
