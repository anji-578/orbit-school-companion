import {
  Bell,
  BellRing,
  BookMarked,
  BookOpen,
  Bot,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle,
  CheckSquare,
  Clipboard,
  CreditCard,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  School,
  Sliders,
  Sparkles,
  Target,
  Trophy,
  Truck,
  UserCheck,
  Users,
  X,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { translate } from '../../i18n'
import { useAuthStore } from '../../auth/authStore'
import { childDisplayName, childFirstName } from '../../lib/linkedStudent'
import { useOrbitStore } from '../../store/orbitStore'
import type { Role } from '../../types'
import { OrbitLogo } from '../brand/OrbitLogo'
import { ChildSwitcher } from '../ui/ChildSwitcher'
import { isPilotDemoEmail } from '../../lib/classLink'

const ROLE_META: Record<
  Role,
  { accent: string; accent2: string; icon: LucideIcon; greetKey: string; subKey: string; labelKey: string; emoji: string }
> = {
  student: {
    accent: '#5B8CFF',
    accent2: '#93C5FD',
    icon: GraduationCap,
    greetKey: 'goodMorning',
    subKey: 'studentSub',
    labelKey: 'studentOS',
    emoji: '🚀',
  },
  parent: {
    accent: '#2DD4BF',
    accent2: '#5EEAD4',
    icon: Users,
    greetKey: 'goodEveningParent',
    subKey: 'parentSub',
    labelKey: 'parentPortal',
    emoji: '🏡',
  },
  teacher: {
    accent: '#FFB454',
    accent2: '#FF8A5C',
    icon: BookOpen,
    greetKey: 'goodDayTeacher',
    subKey: 'teacherSub',
    labelKey: 'teacherSuite',
    emoji: '🍎',
  },
  school: {
    accent: '#7C9CFF',
    accent2: '#C4B5FD',
    icon: School,
    greetKey: 'goodDayAdmin',
    subKey: 'adminSub',
    labelKey: 'schoolSuite',
    emoji: '🏛️',
  },
}

export function getRoleMeta(role: Role) {
  return ROLE_META[role]
}

export type OrbitTab = { id: string; label: string; icon: LucideIcon; badge?: string }

export type OrbitNavGroup = { label: string; tabs: OrbitTab[] }

export function getStudentNavGroups(lang: 'en' | 'te'): OrbitNavGroup[] {
  const t = (key: string) => translate(lang, key)
  return [
    {
      label: t('navToday'),
      tabs: [
        { id: 'dashboard', label: t('navHome'), icon: Home },
        { id: 'schedule', label: t('studentSchedule'), icon: Calendar },
        { id: 'assignments', label: t('studentAssignments'), icon: CheckSquare },
        { id: 'calendar', label: t('sharedCalendarTitle'), icon: CalendarDays },
        { id: 'alerts', label: t('navAnnouncements'), icon: BellRing },
      ],
    },
    {
      label: t('navLearn'),
      tabs: [
        {
          id: 'study-assistant',
          label: t('studentStudyCopilot'),
          icon: BrainCircuit,
          badge: t('navNewBadge'),
        },
        { id: 'syllabus-explorer', label: t('navSubjects'), icon: BookMarked },
        { id: 'scanner', label: t('studentScanner'), icon: Clipboard },
        { id: 'extracurriculars', label: t('navResources'), icon: Target },
      ],
    },
    {
      label: t('navProgress'),
      tabs: [
        { id: 'academics', label: t('navProgressReports'), icon: FileText },
        { id: 'achievements', label: t('studentAchievements'), icon: Trophy },
        { id: 'attendance', label: t('studentAttendance'), icon: CheckCircle },
      ],
    },
  ]
}

/** Primary tabs stay visible; “more” collapses secondary surfaces (parent simplicity). */
export function getTabsForRole(
  role: Role,
  lang: 'en' | 'te',
): { primary: OrbitTab[]; more: OrbitTab[] } {
  const t = (key: string) => translate(lang, key)
  if (role === 'student') {
    const flat = getStudentNavGroups(lang).flatMap((g) => g.tabs)
    return { primary: flat, more: [] }
  }
  const all: Record<Exclude<Role, 'student'>, OrbitTab[]> = {
    parent: [
      { id: 'dashboard', label: t('parentDashboard'), icon: Sliders },
      { id: 'alerts', label: t('alertsTitle'), icon: BellRing },
      { id: 'homework', label: t('parentHomeworkTitle'), icon: CheckSquare },
      { id: 'attendance', label: t('parentAttendanceTitle'), icon: CheckCircle },
      { id: 'payments', label: t('parentPayments'), icon: CreditCard },
      { id: 'academics', label: t('parentReportCard'), icon: FileText },
      { id: 'teachers', label: t('parentTeachers'), icon: Users },
      { id: 'transport', label: t('parentTransport'), icon: Truck },
      { id: 'calendar', label: t('sharedCalendarTitle'), icon: CalendarDays },
      { id: 'scanner', label: t('parentScanner'), icon: Clipboard },
      { id: 'extracurriculars', label: t('parentExtracurriculars'), icon: Target },
    ],
    teacher: [
      { id: 'dashboard', label: t('teacherDashboard'), icon: Sliders },
      { id: 'alerts', label: t('alertsTitle'), icon: BellRing },
      { id: 'teacher-attendance', label: t('teacherAttendanceTitle'), icon: UserCheck },
      { id: 'teacher-homework', label: t('teacherHomeworkTitle'), icon: CheckSquare },
      { id: 'teacher-marks', label: t('teacherMarksTitle'), icon: Clipboard },
      { id: 'teacher-syllabus', label: t('teacherSyllabusTitle'), icon: BookOpen },
      { id: 'scanner', label: t('teacherScanner'), icon: Clipboard },
      { id: 'teacher-leaves', label: t('teacherLeavesTitle'), icon: CalendarDays },
      { id: 'teacher-jobs', label: t('teacherJobsTitle'), icon: Briefcase },
    ],
    school: [
      { id: 'dashboard', label: t('schoolDashboard'), icon: Sliders },
      { id: 'alerts', label: t('alertsTitle'), icon: BellRing },
      { id: 'school-fees', label: t('schoolFeeAuditorTitle'), icon: CreditCard },
      { id: 'school-roster', label: t('schoolRosterTitle'), icon: Users },
      { id: 'school-timetable', label: t('schoolTimetableTitle'), icon: Calendar },
      { id: 'school-broadcast', label: t('schoolBroadcastingTitle'), icon: Bell },
      { id: 'school-leaves', label: t('schoolLeavesTitle'), icon: CalendarDays },
      { id: 'school-calendar', label: t('schoolCalendarTitle'), icon: CalendarDays },
      { id: 'school-hiring', label: t('schoolHiringTitle'), icon: Briefcase },
      { id: 'school-fleet', label: t('schoolFleetTitle'), icon: Truck },
    ],
  }

  const tabs = all[role]
  if (role === 'parent') {
    return { primary: tabs.slice(0, 5), more: tabs.slice(5) }
  }
  if (role === 'teacher') {
    return { primary: tabs.slice(0, 5), more: tabs.slice(5) }
  }
  return { primary: tabs.slice(0, 6), more: tabs.slice(6) }
}

function NavButton({
  item,
  selected,
  onSelect,
}: {
  item: OrbitTab
  selected: boolean
  onSelect: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`nav-node w-full flex items-start gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 relative text-left ${
        selected
          ? 'active font-bold border border-white/10'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
      aria-current={selected ? 'page' : undefined}
    >
      <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className={`h-4 w-4 ${selected ? 'text-[var(--accent2)]' : ''}`} aria-hidden />
      </span>
      <span className="leading-normal flex-1 min-w-0">{item.label}</span>
      {item.badge ? (
        <span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-violet-500/25 text-violet-200 border border-violet-400/30 shrink-0">
          {item.badge}
        </span>
      ) : null}
    </button>
  )
}

export function Sidebar() {
  const role = useOrbitStore((s) => s.role)
  const lang = useOrbitStore((s) => s.lang)
  const activeTab = useOrbitStore((s) => s.activeTab)
  const mobileMenuOpen = useOrbitStore((s) => s.mobileMenuOpen)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)
  const setMobileMenuOpen = useOrbitStore((s) => s.setMobileMenuOpen)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const resetDemoData = useOrbitStore((s) => s.resetDemoData)
  const t = (key: string) => translate(lang, key)
  const { primary, more } = getTabsForRole(role, lang)
  const studentGroups = role === 'student' ? getStudentNavGroups(lang) : null
  const [moreOpen, setMoreOpen] = useState(() => more.some((tab) => tab.id === activeTab))
  const meta = getRoleMeta(role)
  const profileName =
    session?.displayName ??
    (role === 'student' || role === 'parent'
      ? childDisplayName(linkedStudent)
      : role === 'teacher'
        ? 'Mrs. Sarah Davis'
        : role === 'school'
          ? 'Admin Desk'
          : 'Student')
  const profileSub =
    session?.subtitle ??
    (role === 'student' && linkedStudent?.className
      ? `${linkedStudent.className}${linkedStudent.section ? `-${linkedStudent.section}` : ''}`
      : role === 'parent' && linkedStudent
        ? childFirstName(linkedStudent)
        : t(meta.subKey))
  const showDemoChrome =
    session?.provider === 'local-demo' || isPilotDemoEmail(session?.email ?? '')

  const handleLogout = () => {
    void logout().then(() => setMobileMenuOpen(false))
  }

  const go = (id: string) => {
    setActiveTab(id)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {mobileMenuOpen ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 bg-black/55 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`orbit-mobile-nav fixed md:sticky top-0 left-0 z-50 md:z-30 h-dvh w-72 glass-strong border-r border-white/10 p-5 flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Primary navigation"
      >
        <div className="space-y-5 overflow-y-auto orbit-scroll pr-1 flex-1 min-h-0">
          <div className="flex items-center justify-between px-1 overflow-visible py-0.5">
            <OrbitLogo variant="lockup" />
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt=""
              className="w-10 h-10 rounded-full border border-white/20 object-cover shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{profileName}</h4>
              <span className="text-[9px] font-extrabold mt-1 block truncate" style={{ color: meta.accent }}>
                {profileSub}
              </span>
            </div>
          </div>

          <ChildSwitcher />

          <nav className="space-y-4" aria-label={`${role} sections`}>
            {studentGroups ? (
              studentGroups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="px-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                    {group.label}
                  </p>
                  {group.tabs.map((item) => (
                    <NavButton
                      key={item.id}
                      item={item}
                      selected={activeTab === item.id}
                      onSelect={() => go(item.id)}
                    />
                  ))}
                </div>
              ))
            ) : (
              <>
                {primary.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    selected={activeTab === item.id}
                    onSelect={() => go(item.id)}
                  />
                ))}
                {more.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMoreOpen((v) => !v)}
                      className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300"
                      aria-expanded={moreOpen}
                    >
                      {moreOpen ? (
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {t('navMore')}
                    </button>
                    {moreOpen
                      ? more.map((item) => (
                          <NavButton
                            key={item.id}
                            item={item}
                            selected={activeTab === item.id}
                            onSelect={() => go(item.id)}
                          />
                        ))
                      : null}
                  </>
                ) : null}
              </>
            )}
          </nav>
        </div>

        <div className="space-y-3 mt-4 shrink-0">
          {role === 'student' ? (
            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-violet-500/25 flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 text-violet-200" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-violet-200/80">
                    {t('needHelpTitle')}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-snug">{t('needHelpSub')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => go('study-assistant')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {t('askOrbitAi')}
              </button>
            </div>
          ) : null}

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">
              {t('signedInAs')}
            </span>
            <p className="text-[10px] text-slate-300 px-1 truncate">{session?.email}</p>
            {showDemoChrome ? (
              <button
                type="button"
                onClick={() => {
                  resetDemoData()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold bg-[#0D1120] text-amber-200/90 hover:text-amber-100 border border-amber-500/20 transition"
              >
                {t('resetDemo')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold bg-[#0D1120] text-slate-200 hover:text-white border border-white/10 transition"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              {t('logOut')}
            </button>
          </div>
        </div>
      </aside>

      <button
        type="button"
        className="fixed top-3 left-3 z-30 md:hidden p-2 rounded-xl bg-[var(--panel)] border border-white/10 text-white shadow-lg"
        aria-label="Open menu"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  )
}
