import type {
  AttendanceRecord,
  BroadcastMessage,
  CalendarEvent,
  Candidate,
  CoachingItem,
  FeeItem,
  FleetBus,
  HomeworkTask,
  JobVacancy,
  LeaveRequest,
  NotificationItem,
  PaymentRecord,
  RosterStudent,
  SoftSkill,
  StudentGrade,
  SyllabusTopic,
  TeacherProfile,
} from '../types'

export const STUDENT_NAME = 'Ananya Rao'
export const CLASS_LABEL = 'Class 11-A · Roll 14'

export const extracurricularListing: Record<string, CoachingItem[]> = {
  sports: [
    { title: 'Sunrise Cricket Academy', coach: 'Coach Vinay Kumar', phone: '+91 94451 12345', cost: '₹1,500/month', loc: 'Ground A' },
    { title: 'Elite Football Club', coach: 'Coach Marcus Jenkins', phone: '+91 94451 67890', cost: '₹1,800/month', loc: 'Main Turf' },
  ],
  drawing: [
    { title: 'Creative Minds Painting Academy', coach: 'Instructor Aruna Devi', phone: '+91 94452 11223', cost: '₹1,000/month', loc: 'Art Studio 1' },
  ],
  singing: [
    { title: 'Swarasdhara Classical Vocals', coach: 'Guru K. Swarnalatha', phone: '+91 94453 54321', cost: '₹1,200/month', loc: 'Music Room A' },
  ],
  dancing: [
    { title: 'Kuchipudi Classical Dance', coach: 'Guru Sreeleela Devi', phone: '+91 94454 09876', cost: '₹1,400/month', loc: 'Dance Hall 1' },
    { title: 'Modern Hip-Hop Studio', coach: 'Choreographer Rakesh', phone: '+91 94454 11223', cost: '₹1,600/month', loc: 'Fitness Studio' },
  ],
}

export const subjectSyllabusDatabase: Record<string, SyllabusTopic[]> = {
  mathSubject: [
    {
      name: 'Algebraic Equations',
      scoring: 92,
      strength: 'High',
      subtopics: ['Negative variables shifting', 'Cross multiplication fractions', 'Coefficient balancing'],
      quizQuery: 'Solve equations transposition algebra',
      mistakeText: 'Dropped algebraic sign shifting coefficients on June 12 midterm.',
    },
    {
      name: 'Multiplying Fractions',
      scoring: 86,
      strength: 'High',
      subtopics: ['Numerator/Denominator alignment', 'Simplifying coefficients'],
      quizQuery: 'fractions calculations',
      mistakeText: 'Unfinished decimal divisions during Chapter 2 test.',
    },
  ],
  scienceSubject: [
    {
      name: 'Photosynthesis Leaf Cycles',
      scoring: 81,
      strength: 'High',
      subtopics: ['Chloroplast gas cycles', 'Photosynthesis balancing'],
      quizQuery: 'photosynthesis cycles botany',
      mistakeText: 'Confused chloroplast chlorophyll labels during plant cycle evaluation on June 18.',
    },
  ],
  chemLabSubject: [
    {
      name: 'Chemical Balancing Coefficients',
      scoring: 56,
      strength: 'Needs Practice',
      subtopics: ['Stoichiometry balancing laws', 'Multiplier recipes stoichiometry'],
      quizQuery: 'balancing chemical equations coefficient chemistry',
      mistakeText: 'Treats chemical formulas as immutable instead of stoichiometry multipliers.',
    },
  ],
}

export const subjectProgressHistory: Record<
  string,
  { exams: string[]; marks: number[]; classAvg: number[]; ranks: number[] }
> = {
  mathSubject: {
    exams: ['Unit Test 1', 'Quarterly', 'Half-Yearly', 'Pre-Board', 'Final Exam'],
    marks: [40, 42, 45, 48, 49],
    classAvg: [35, 36, 38, 39, 41],
    ranks: [14, 10, 6, 2, 1],
  },
  scienceSubject: {
    exams: ['Unit Test 1', 'Quarterly', 'Half-Yearly', 'Pre-Board', 'Final Exam'],
    marks: [35, 37, 39, 41, 45],
    classAvg: [32, 33, 34, 34, 36],
    ranks: [18, 15, 11, 8, 4],
  },
  chemLabSubject: {
    exams: ['Unit Test 1', 'Quarterly', 'Half-Yearly', 'Pre-Board', 'Final Exam'],
    marks: [22, 24, 25, 28, 41],
    classAvg: [36, 37, 37, 37, 39],
    ranks: [42, 39, 38, 35, 12],
  },
}

export const schoolTeachers: TeacherProfile[] = [
  {
    id: 't_math',
    name: 'Mrs. Sarah Davis',
    subjectKey: 'mathSubject',
    qualification: 'M.Sc. in Mathematics, B.Ed.',
    phone: '+91 98450 12345',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 't_science',
    name: 'Dr. Anil Chawla',
    subjectKey: 'scienceSubject',
    qualification: 'Ph.D. in Physics, M.Ed.',
    phone: '+91 98450 67890',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 't_chem',
    name: 'Prof. Meera Sharma',
    subjectKey: 'chemLabSubject',
    qualification: 'M.Sc. Chemistry, B.Ed.',
    phone: '+91 98450 24680',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  },
]

export const softSkills: SoftSkill[] = [
  { label: 'Classroom Focus', score: 4 },
  { label: 'Handwriting Neatness', score: 3 },
  { label: 'Listening Skills', score: 5 },
  { label: 'Working with Friends', score: 4 },
  { label: 'Problem Solving', score: 3 },
]

export const ALL_BADGES = [
  { name: 'Streak Keeper', desc: '5-day study streak' },
  { name: 'Quiz Whiz', desc: 'Perfect practice quiz' },
  { name: 'Task Master', desc: 'Clear all homework' },
  { name: 'Early Bird', desc: 'Arrive before 8 AM' },
  { name: 'Rising Scholar', desc: 'Jump 10+ ranks' },
  { name: 'Curious Mind', desc: 'Ask OrbitAI often' },
  { name: 'Concept Master', desc: 'Pass remediation quiz' },
] as const

export const initialAttendance: AttendanceRecord[] = [
  { date: 'June 1', day: 'Mon', status: 'Present' },
  { date: 'June 2', day: 'Tue', status: 'Present' },
  { date: 'June 3', day: 'Wed', status: 'Present' },
  { date: 'June 4', day: 'Thu', status: 'Present' },
  { date: 'June 5', day: 'Fri', status: 'Present' },
  { date: 'June 8', day: 'Mon', status: 'Present' },
  { date: 'June 9', day: 'Tue', status: 'Present' },
  { date: 'June 10', day: 'Wed', status: 'Absent', reason: 'Medical Leave (Fever)' },
  { date: 'June 11', day: 'Thu', status: 'Present' },
  { date: 'June 12', day: 'Fri', status: 'Present' },
  { date: 'June 15', day: 'Mon', status: 'Present' },
  { date: 'June 16', day: 'Tue', status: 'Present' },
  { date: 'June 17', day: 'Wed', status: 'Present' },
  { date: 'June 18', day: 'Thu', status: 'Absent', reason: 'Family Event (Approved)' },
  { date: 'June 19', day: 'Fri', status: 'Present' },
]

export const initialTasks: HomeworkTask[] = [
  { id: 1, subject: 'Science', task: 'Solve Chapter 3 balancing equations', due: 'Tomorrow', xp: 100, completed: false, difficulty: 'Hard' },
  { id: 2, subject: 'English', task: 'Write story outline on your pet dog', due: 'Due in 2 days', xp: 80, completed: false, difficulty: 'Medium' },
  { id: 3, subject: 'Mathematics', task: 'Do Page 40 multiplication questions', due: 'Completed', xp: 50, completed: true, difficulty: 'Easy' },
]

export const initialGrades: StudentGrade[] = [
  {
    id: 'g1',
    name: 'Ananya Rao',
    math: '48/50',
    science: '41/50',
    chem: '28/50',
    comment: 'Excellent progress; Chemistry formulas need slight focus before final term.',
  },
  {
    id: 'g2',
    name: 'Sarah Jenkins',
    math: '35/50',
    science: '41/50',
    chem: '46/50',
    comment: 'Outstanding chemistry labs; grammar structures need polish.',
  },
]

export const initialRoster: RosterStudent[] = [
  { id: 's1', name: 'Ananya Rao', present: true, isDemo: true },
  { id: 's2', name: 'Sarah Jenkins', present: true },
  { id: 's3', name: 'Marcus Vance', present: false },
  { id: 's4', name: 'Pranitha K.', present: true },
]

export const initialFees: FeeItem[] = [
  { id: '1', name: 'Q1 Tuition Fee Bill', amount: 35000, status: 'Unpaid', category: 'Tuition' },
  { id: '2', name: 'School Science Lab Deposit', amount: 4500, status: 'Unpaid', category: 'Science Labs' },
  { id: '3', name: 'Quarterly School Bus Service', amount: 3000, status: 'Unpaid', category: 'Bus Transit' },
]

export const initialPaymentHistory: PaymentRecord[] = [
  { id: 101, name: 'Registration Fee Deposit', amount: 15000, status: 'Paid', date: 'April 02, 2026', receiptId: 'REC-98402' },
  { id: 102, name: 'School Sports Day Fee', amount: 5000, status: 'Paid', date: 'April 18, 2026', receiptId: 'REC-91845' },
]

export const initialBroadcasts: BroadcastMessage[] = [
  {
    id: 1,
    target: 'All',
    title: 'Sports Day Rescheduled',
    content: 'School annual sports tournament has been shifted to June 28th due to weather conditions.',
    date: 'Today',
  },
  {
    id: 2,
    target: 'Parents',
    title: 'Quarterly PTA Meet',
    content: 'The interactive Parent Teacher session is scheduled this Saturday in the main hall.',
    date: 'Yesterday',
  },
]

export const initialCalendar: CalendarEvent[] = [
  { id: 1, title: 'Half-Yearly Exams', category: 'Exams', date: 'July 15, 2026' },
  { id: 2, title: 'Independence Day Holiday', category: 'Holidays', date: 'August 15, 2026' },
  { id: 3, title: 'Quarterly PTA Meet', category: 'PTA Meetings', date: 'July 5, 2026' },
  { id: 4, title: 'Inter-School Cricket Finals', category: 'Extracurricular', date: 'June 28, 2026' },
]

export const initialLeaves: LeaveRequest[] = [
  { id: 1, reason: 'Personal Medical Checkup', date: 'June 25, 2026', status: 'Approved' },
]

export const initialNotifications: NotificationItem[] = [
  { id: 1, role: 'all', title: 'Sports Day Rescheduled', body: 'Annual sports tournament moved to June 28.', unread: true, time: '2h ago' },
  { id: 2, role: 'parent', title: 'Fee Reminder', body: 'Q1 tuition balance of ₹42,500 is still outstanding.', unread: true, time: '5h ago' },
  { id: 3, role: 'student', title: 'Homework Due', body: 'Chemistry balancing equations due tomorrow.', unread: true, time: '1d ago' },
  { id: 4, role: 'teacher', title: 'Leave Approved', body: 'Your June 25 leave request was approved.', unread: false, time: '2d ago' },
  { id: 5, role: 'school', title: 'New Applicant', body: 'Vamsi Krishna applied for Mathematics Expert.', unread: true, time: '3d ago' },
]

export const teacherVacancies: JobVacancy[] = [
  { id: 1, title: 'Secondary Mathematics Expert', school: 'Apex Public School', pay: '₹45,000 / month', match: 'Excellent Match', matchPct: 94 },
  { id: 2, title: 'Primary English Instructor', school: 'Orion International', pay: '₹38,000 / month', match: 'Good Match', matchPct: 78 },
]

export const initialCandidates: Candidate[] = [
  { id: 1, name: 'Vamsi Krishna', subject: 'Mathematics', experience: '5 Years', qualification: 'M.Sc Mathematics', status: 'Applied' },
  { id: 2, name: 'Aruna Kumari', subject: 'English Grammar', experience: '8 Years', qualification: 'M.A English, B.Ed', status: 'Reviewing' },
]

export const initialFleet: FleetBus[] = [
  { id: 'bus_14', route: 'Route 14 - Orion Layout', active: true, driver: 'Ramesh Prasad', phone: '+91 98765 43210', position: 55, speed: 38, capacity: '32/40' },
  { id: 'bus_09', route: 'Route 9 - Pragathi Block', active: true, driver: 'K. Somulu', phone: '+91 98765 11122', position: 25, speed: 32, capacity: '28/40' },
  { id: 'bus_22', route: 'Route 22 - Pragathi Hills', active: false, driver: 'M. Narasimha', phone: '+91 98765 33344', position: 0, speed: 0, capacity: '0/40' },
]

export const syllabusTimeline = [
  { id: 'sy1', subject: 'Mathematics', chapter: 'Multiplying fractions', plannedDate: 'June 22', progress: 100 },
  { id: 'sy2', subject: 'Science', chapter: 'Plant Respiration cycles', plannedDate: 'June 25', progress: 80 },
  { id: 'sy3', subject: 'Chemistry Lab', chapter: 'Equation coefficients', plannedDate: 'June 30', progress: 40 },
]

export const timetableByDay: Record<
  string,
  { theory: { id: string; code: string; name: string; start: string; end: string; room: string; teacher: string }[]; lab: { id: string; code: string; name: string; start: string; end: string; room: string; teacher: string }[] }
> = {
  MON: {
    theory: [
      { id: 'm1', code: 'A1', name: 'Mathematics', start: '08:00', end: '08:50', room: 'Room 204', teacher: 'Mrs. Davis' },
      { id: 'm2', code: 'F1', name: 'Science', start: '08:55', end: '09:45', room: 'Room 301', teacher: 'Dr. Chawla' },
      { id: 'm3', code: 'D1', name: 'English Grammar', start: '09:50', end: '10:40', room: 'Room 105', teacher: 'Mr. Hughes' },
      { id: 'm4', code: 'TB1', name: 'Social Studies', start: '10:45', end: '11:35', room: 'Room 203', teacher: 'Dr. Swamy' },
    ],
    lab: [{ id: 'ml1', code: 'L1', name: 'Science Lab', start: '14:00', end: '14:50', room: 'Lab 2', teacher: 'Prof. Sharma' }],
  },
  TUE: {
    theory: [
      { id: 't1', code: 'A2', name: 'Mathematics', start: '08:00', end: '08:50', room: 'Room 204', teacher: 'Mrs. Davis' },
      { id: 't2', code: 'C1', name: 'Chemistry Lab Theory', start: '08:55', end: '09:45', room: 'Room 210', teacher: 'Prof. Sharma' },
      { id: 't3', code: 'E1', name: 'English Literature', start: '09:50', end: '10:40', room: 'Room 105', teacher: 'Mr. Hughes' },
      { id: 't4', code: 'P1', name: 'Physical Education', start: '10:45', end: '11:35', room: 'Ground A', teacher: 'Coach Vinay' },
    ],
    lab: [{ id: 'tl1', code: 'L2', name: 'Chemistry Lab', start: '14:00', end: '14:50', room: 'Lab 1', teacher: 'Prof. Sharma' }],
  },
  WED: {
    theory: [
      { id: 'w1', code: 'A3', name: 'Mathematics', start: '08:00', end: '08:50', room: 'Room 204', teacher: 'Mrs. Davis' },
      { id: 'w2', code: 'F2', name: 'Science', start: '08:55', end: '09:45', room: 'Room 301', teacher: 'Dr. Chawla' },
      { id: 'w3', code: 'S1', name: 'Social Studies', start: '09:50', end: '10:40', room: 'Room 203', teacher: 'Dr. Swamy' },
      { id: 'w4', code: 'D2', name: 'English Grammar', start: '10:45', end: '11:35', room: 'Room 105', teacher: 'Mr. Hughes' },
    ],
    lab: [{ id: 'wl1', code: 'L3', name: 'Computer Lab', start: '14:00', end: '14:50', room: 'Lab 3', teacher: 'Ms. Priya' }],
  },
  THU: {
    theory: [
      { id: 'th1', code: 'A4', name: 'Mathematics', start: '08:00', end: '08:50', room: 'Room 204', teacher: 'Mrs. Davis' },
      { id: 'th2', code: 'F3', name: 'Science', start: '08:55', end: '09:45', room: 'Room 301', teacher: 'Dr. Chawla' },
      { id: 'th3', code: 'C2', name: 'Chemistry', start: '09:50', end: '10:40', room: 'Room 210', teacher: 'Prof. Sharma' },
      { id: 'th4', code: 'AR1', name: 'Art Period', start: '10:45', end: '11:35', room: 'Art Studio', teacher: 'Ms. Aruna' },
    ],
    lab: [{ id: 'thl1', code: 'L4', name: 'Science Lab', start: '14:00', end: '14:50', room: 'Lab 2', teacher: 'Dr. Chawla' }],
  },
  FRI: {
    theory: [
      { id: 'f1', code: 'A5', name: 'Mathematics Review', start: '08:00', end: '08:50', room: 'Room 204', teacher: 'Mrs. Davis' },
      { id: 'f2', code: 'F4', name: 'Science Review', start: '08:55', end: '09:45', room: 'Room 301', teacher: 'Dr. Chawla' },
      { id: 'f3', code: 'D3', name: 'English Writing', start: '09:50', end: '10:40', room: 'Room 105', teacher: 'Mr. Hughes' },
      { id: 'f4', code: 'AS1', name: 'Assembly / Mentoring', start: '10:45', end: '11:35', room: 'Main Hall', teacher: 'Class Teacher' },
    ],
    lab: [{ id: 'fl1', code: 'L5', name: 'Open Lab Practice', start: '14:00', end: '14:50', room: 'Lab 2', teacher: 'Prof. Sharma' }],
  },
}

export const todayTimeline = [
  { name: 'Mathematics', time: '08:00 AM', room: 'Room 204', status: 'Completed' as const },
  { name: 'Science', time: '10:00 AM', room: 'Room 301', status: 'Live' as const },
  { name: 'Chemistry Lab', time: '11:15 AM', room: 'Lab 2', status: 'Upcoming' as const },
  { name: 'English Grammar', time: '01:00 PM', room: 'Room 105', status: 'Upcoming' as const },
  { name: 'Social Studies', time: '02:00 PM', room: 'Room 203', status: 'Upcoming' as const },
]

export const remediationTemplates = {
  chemistry: {
    title: 'Science Midterm Answer Sheet — Ananya Rao',
    flaggedWeakness: 'Balancing Chemical Coefficients (Chapter 3)',
    analysisText:
      'Ananya understands reactants and products well, but repeatedly gets confused with stoichiometry multiplier coefficients. She treats formula numbers as immutable rather than multiplying entire batches.',
    modelEscalation: 'Gemini Flash (demo triage)',
    confidence: 82,
    analogyText: `### 🥞 Balancing Equations is just a Pancake Recipe!

To make exactly **one stack of pancakes**, you need:
- **2 Eggs** ($E$)
- **1 Cup of Flour** ($F$)

$$Recipe: 2E + 1F \\rightarrow 1 Stack$$

You cannot rewrite the pancake itself. You balance by adding **multipliers** in front of ingredients.

$$\\mathbf{2}H_2 + O_2 \\rightarrow \\mathbf{2}H_2O$$`,
    validationQuestion: "Based on the recipe multiplier rule, balance: ? H₂ + O₂ → 2 H₂O. What is '?'",
    options: ['1', '2', '3', '4'],
    correctIndex: 1,
    successToast: "Chemistry midterm updated to 48/50! +100 XP · Concept Master unlocked.",
  },
  mathematics: {
    title: 'Algebraic Equations Term Test — Ananya Rao',
    flaggedWeakness: 'Negative Number Multiplication & Cross-Inversion',
    analysisText:
      'Ananya frequently drops algebraic minus signs during equation relocations. She simplifies linear variables correctly but flips equations incorrectly when cross-multiplying.',
    modelEscalation: 'Gemini Pro cascade (demo)',
    confidence: 54,
    analogyText: `### ⚖️ The Equals Sign is a Playground Seesaw!

An equation is a balanced seesaw.
- If $+10$ crosses $=$, it becomes $-10$ to keep balance.
- Two negatives multiply to a positive.

$$-3x + 10 = -5 \\implies -3x = -15 \\implies x = 5$$`,
    validationQuestion: 'Solve: -3x + 10 = -5. Find x.',
    options: ['x = -5', 'x = 5', 'x = -15', 'x = 15'],
    correctIndex: 1,
    successToast: 'Mathematics midterm updated to 48/50! +100 XP synchronized.',
  },
} as const

export const offlineAiAnswers: Record<string, string> = {
  default: `### Newton's Second Law — Football Kick

Force is how hard you kick a football.
- Light tap → small acceleration
- Strong strike → big acceleration

**Formula:** $F = m \\times a$

Heavier ball needs more force for the same speed-up.`,
  chemistry: `### Stoichiometry — Kitchen Batch Recipe

Chemical formulas are fixed recipes. You change **how many batches**, not the recipe itself.

$$2H_2 + O_2 \\rightarrow 2H_2O$$`,
  algebra: `### Algebra — Seesaw Balance

Whatever you do to one side, do to the other. Crossing $=$ flips the sign.`,
}

export const FALLBACK_QUIZ = {
  topic: 'Stoichiometry & Coefficient Balancing',
  questions: [
    {
      id: 1,
      question: "What coefficient balances: ? H₂ + O₂ → 2 H₂O?",
      options: ['1', '2', '3', '4'],
      answerIndex: 1,
    },
    {
      id: 2,
      question: 'Why can\'t you rewrite H₂O as H₂O₂ when balancing?',
      options: ['Atoms change identity', 'It becomes a different compound', 'Oxygen is scarce', 'Hydrogen is diatomic'],
      answerIndex: 1,
    },
    {
      id: 3,
      question: 'Balancing equations mainly adjusts…',
      options: ['Subscripts inside formulas', 'Multipliers in front of formulas', 'Atomic numbers', 'Product names'],
      answerIndex: 1,
    },
  ],
}
