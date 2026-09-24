import { useState } from 'react'
import {
  Award,
  BookOpen,
  Edit,
  GraduationCap,
  Layers,
  Plus,
  Trash2,
  Trophy,
} from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { Panel, Card } from '../../components/ui/primitives'
import { translate } from '../../i18n'
import { ConfidentialDocsSection } from '../student/ConfidentialDocsSection'
import type { ProfileListItem, TeacherAcademicProfile as TeacherProfileShape } from '../../types'

export function TeacherProfilePanel() {
  const lang = useOrbitStore((s) => s.lang)
  const t = (key: string) => translate(lang, key)
  const profile = useOrbitStore((s) => s.teacherAcademicProfile)
  const updateTeacherAcademicProfile = useOrbitStore((s) => s.updateTeacherAcademicProfile)
  const teacherActiveClass = useOrbitStore((s) => s.teacherActiveClass)

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<TeacherProfileShape>(profile)
  const [newSubject, setNewSubject] = useState('')
  const [newClass, setNewClass] = useState('')
  const [newQual, setNewQual] = useState({ title: '', subtitle: '', date: '' })
  const [newAch, setNewAch] = useState({ title: '', subtitle: '', date: '' })

  const startEdit = () => {
    setEditForm(profile)
    setIsEditing(true)
  }

  const save = () => {
    updateTeacherAcademicProfile(editForm)
    setIsEditing(false)
    useOrbitStore.getState().triggerToast(t('teacherProfileSaved'))
  }

  const addTag = (field: 'subjects' | 'classes', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return
    if (editForm[field].includes(value.trim())) {
      setter('')
      return
    }
    setEditForm({ ...editForm, [field]: [...editForm[field], value.trim()] })
    setter('')
  }

  const removeTag = (field: 'subjects' | 'classes', value: string) => {
    setEditForm({ ...editForm, [field]: editForm[field].filter((v) => v !== value) })
  }

  const addListItem = (
    field: 'qualifications' | 'achievements' | 'certifications',
    item: Omit<ProfileListItem, 'id'>,
    reset: () => void,
  ) => {
    if (!item.title.trim()) return
    setEditForm({
      ...editForm,
      [field]: [...editForm[field], { ...item, id: `${field}_${Date.now()}` }],
    })
    reset()
  }

  const removeListItem = (field: 'qualifications' | 'achievements' | 'certifications', id: string) => {
    setEditForm({
      ...editForm,
      [field]: editForm[field].filter((item) => item.id !== id),
    })
  }

  return (
    <Panel
      title={t('teacherProfileTitle')}
      subtitle={t('teacherProfileSub')}
      action={
        !isEditing ? (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition"
          >
            <Edit className="h-3.5 w-3.5" aria-hidden />
            {t('teacherEditProfile')}
          </button>
        ) : null
      }
    >
      {isEditing ? (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {(
              [
                ['name', t('teacherFieldName')],
                ['school', t('teacherFieldSchool')],
                ['employeeId', t('teacherFieldEmployeeId')],
                ['phone', t('teacherFieldPhone')],
                ['email', t('teacherFieldEmail')],
                ['photoUrl', t('teacherFieldPhoto')],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</label>
                <input
                  type="text"
                  value={editForm[key]}
                  onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-[var(--accent)]/40"
                />
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('teacherSubjects')}</p>
              <div className="flex flex-wrap gap-1.5">
                {editForm.subjects.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => removeTag('subjects', s)}
                    className="px-2 py-1 rounded-lg bg-sky-500/10 text-sky-200 border border-sky-500/20 text-[11px] font-bold"
                  >
                    {s} ×
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder={t('teacherAddSubject')}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => addTag('subjects', newSubject, setNewSubject)}
                  className="px-3 py-2 rounded-xl bg-white/10 text-xs font-bold"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('teacherClasses')}</p>
              <div className="flex flex-wrap gap-1.5">
                {editForm.classes.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => removeTag('classes', c)}
                    className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-200 border border-amber-500/20 text-[11px] font-bold"
                  >
                    {c} ×
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  placeholder={t('teacherAddClass')}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => addTag('classes', newClass, setNewClass)}
                  className="px-3 py-2 rounded-xl bg-white/10 text-xs font-bold"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          {(
            [
              ['qualifications', t('teacherQualifications'), newQual, setNewQual] as const,
              ['achievements', t('teacherAchievements'), newAch, setNewAch] as const,
            ]
          ).map(([field, label, draft, setDraft]) => (
            <div key={field} className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
              {editForm[field].map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-white/10">
                  <div>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {item.subtitle} · {item.date}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeListItem(field, item.id)} className="text-rose-300 p-1">
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ))}
              <div className="grid sm:grid-cols-4 gap-2">
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Title"
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
                <input
                  value={draft.subtitle}
                  onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                  placeholder="Subtitle"
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
                <div className="flex gap-2">
                  <input
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                    placeholder="Year"
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      addListItem(field, draft, () => setDraft({ title: '', subtitle: '', date: '' }))
                    }
                    className="px-3 py-2 rounded-xl bg-white/10 text-xs font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setEditForm(profile)
                setIsEditing(false)
              }}
              className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold text-slate-300"
            >
              Cancel
            </button>
            <button type="button" onClick={save} className="btn-accent px-4 py-2 rounded-xl text-xs font-bold">
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-white/[0.02] border border-white/10 rounded-2xl">
            <img
              src={profile.photoUrl}
              alt=""
              className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10 shrink-0"
            />
            <div className="text-center sm:text-left space-y-1.5 min-w-0">
              <h3 className="text-xl font-black text-white font-display">{profile.name}</h3>
              <p className="text-sm text-slate-300 font-semibold">{profile.school}</p>
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                <GraduationCap className="h-4 w-4 text-[var(--accent2)]" aria-hidden />
                {profile.employeeId} · {profile.email}
              </p>
              <p className="text-[10px] text-slate-500">
                {t('teacherFocusing')} <span className="text-[var(--accent2)] font-bold">{teacherActiveClass || '—'}</span>
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-sky-400" aria-hidden />
                {t('teacherSubjects')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.subjects.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </Card>
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-amber-400" aria-hidden />
                {t('teacherClasses')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.classes.map((c) => (
                  <span key={c} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                    {c}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-violet-400" aria-hidden />
                {t('teacherQualifications')}
              </h3>
              {profile.qualifications.map((item) => (
                <div key={item.id}>
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {item.subtitle} · {item.date}
                  </p>
                </div>
              ))}
            </Card>
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-emerald-400" aria-hidden />
                {t('teacherAchievements')}
              </h3>
              {profile.achievements.map((item) => (
                <div key={item.id}>
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {item.subtitle} · {item.date}
                  </p>
                </div>
              ))}
              {profile.certifications.map((item) => (
                <div key={item.id}>
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {item.subtitle} · {item.date}
                  </p>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      <div className="mt-6">
        <ConfidentialDocsSection
          title={t('teacherSecureFolder')}
          description={t('teacherSecureFolderHint')}
        />
      </div>
    </Panel>
  )
}
