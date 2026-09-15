import { useState } from 'react'
import {
  Edit,
  GraduationCap,
  Sparkles,
  BookOpen,
  Award,
  Calendar,
  Briefcase,
  Users,
  Compass,
  Trophy,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { Panel, Card } from '../../components/ui/primitives'
import type { StudentAcademicProfile, ProfileListItem } from '../../types'
import { ConfidentialDocsSection } from './ConfidentialDocsSection'

export function AcademicProfile() {
  const lang = useOrbitStore((s) => s.lang)
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const updateStudentProfile = useOrbitStore((s) => s.updateStudentProfile)

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<StudentAcademicProfile>(studentProfile)

  // Temp state for adding items to lists
  const [newInterest, setNewInterest] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newLanguage, setNewLanguage] = useState('')

  // Temp state for adding complex list items
  const [newCert, setNewCert] = useState({ title: '', subtitle: '', date: '' })
  const [newProj, setNewProj] = useState({ title: '', subtitle: '', date: '' })

  const handleSave = () => {
    updateStudentProfile(editForm)
    setIsEditing(false)
    useOrbitStore.getState().triggerToast('Profile updated successfully!')
  }

  const handleCancel = () => {
    setEditForm(studentProfile)
    setIsEditing(false)
  }

  const addTag = (field: keyof StudentAcademicProfile, value: string, setter: (v: string) => void) => {
    if (!value.trim()) return
    const currentList = (editForm[field] as string[]) || []
    if (!currentList.includes(value.trim())) {
      setEditForm({
        ...editForm,
        [field]: [...currentList, value.trim()],
      })
    }
    setter('')
  }

  const removeTag = (field: keyof StudentAcademicProfile, value: string) => {
    const currentList = (editForm[field] as string[]) || []
    setEditForm({
      ...editForm,
      [field]: currentList.filter((item) => item !== value),
    })
  }

  const addListItem = (field: keyof StudentAcademicProfile, item: Omit<ProfileListItem, 'id'>, resetter: () => void) => {
    if (!item.title.trim()) return
    const currentList = (editForm[field] as ProfileListItem[]) || []
    const newItem: ProfileListItem = {
      ...item,
      id: `${field}_${Date.now()}`,
    }
    setEditForm({
      ...editForm,
      [field]: [...currentList, newItem],
    })
    resetter()
  }

  const removeListItem = (field: keyof StudentAcademicProfile, id: string) => {
    const currentList = (editForm[field] as ProfileListItem[]) || []
    setEditForm({
      ...editForm,
      [field]: currentList.filter((item) => item.id !== id),
    })
  }

  return (
    <Panel
      title={lang === 'te' ? 'అకడమిక్ ప్రొఫైల్' : 'Academic Profile'}
      subtitle={lang === 'te' ? 'నా విద్యా గుర్తింపు మరియు సాధనలు' : 'My Academic Identity & Achievements'}
      action={
        !isEditing && (
          <button
            type="button"
            onClick={() => {
              setEditForm(studentProfile)
              setIsEditing(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition"
          >
            <Edit className="h-3.5 w-3.5" />
            {lang === 'te' ? 'సవరించు' : 'Edit Profile'}
          </button>
        )
      }
    >
      {isEditing ? (
        /* EDIT MODE */
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Profile Photo URL</label>
              <input
                type="text"
                value={editForm.photoUrl}
                onChange={(e) => setEditForm({ ...editForm, photoUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">School</label>
              <input
                type="text"
                value={editForm.school}
                onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Grade / Class</label>
              <input
                type="text"
                value={editForm.grade}
                onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Tags Sections */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Interests */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-sky-400" /> Interests
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add interest..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag('interests', newInterest, setNewInterest)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => addTag('interests', newInterest, setNewInterest)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {editForm.interests.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs font-bold">
                    {tag}
                    <button type="button" onClick={() => removeTag('interests', tag)} className="text-sky-400 hover:text-sky-200">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Subjects */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-violet-400" /> Subjects Enjoyed
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add subject..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag('subjects', newSubject, setNewSubject)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => addTag('subjects', newSubject, setNewSubject)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {editForm.subjects.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 text-xs font-bold">
                    {tag}
                    <button type="button" onClick={() => removeTag('subjects', tag)} className="text-violet-400 hover:text-violet-200">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400" /> Skills
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag('skills', newSkill, setNewSkill)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => addTag('skills', newSkill, setNewSkill)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {editForm.skills.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                    {tag}
                    <button type="button" onClick={() => removeTag('skills', tag)} className="text-amber-400 hover:text-amber-200">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-400" /> Languages
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add language..."
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag('languages', newLanguage, setNewLanguage)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => addTag('languages', newLanguage, setNewLanguage)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {editForm.languages.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                    {tag}
                    <button type="button" onClick={() => removeTag('languages', tag)} className="text-emerald-400 hover:text-emerald-200">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Complex Lists Section */}
          <div className="space-y-6">
            {/* Certifications */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="h-4 w-4 text-blue-400" /> Certifications
              </h4>
              <div className="grid sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={newCert.title}
                  onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Issuer"
                  value={newCert.subtitle}
                  onChange={(e) => setNewCert({ ...newCert, subtitle: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Date"
                    value={newCert.date}
                    onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addListItem('certifications', newCert, () => setNewCert({ title: '', subtitle: '', date: '' }))}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {editForm.certifications.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.subtitle} · {item.date}</p>
                    </div>
                    <button type="button" onClick={() => removeListItem('certifications', item.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-indigo-400" /> Projects
              </h4>
              <div className="grid sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={newProj.title}
                  onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newProj.subtitle}
                  onChange={(e) => setNewProj({ ...newProj, subtitle: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Year"
                    value={newProj.date}
                    onChange={(e) => setNewProj({ ...newProj, date: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addListItem('projects', newProj, () => setNewProj({ title: '', subtitle: '', date: '' }))}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {editForm.projects.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.subtitle} · {item.date}</p>
                    </div>
                    <button type="button" onClick={() => removeListItem('projects', item.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-xs font-bold text-black transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* VIEW MODE */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-white/[0.02] border border-white/10 rounded-2xl">
            <img
              src={studentProfile.photoUrl}
              alt={studentProfile.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10 shrink-0"
            />
            <div className="text-center sm:text-left space-y-1.5 min-w-0">
              <h3 className="text-xl font-black text-white font-display flex items-center justify-center sm:justify-start gap-2">
                {studentProfile.name}
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent2)] border border-[var(--accent)]/25">
                  Student
                </span>
              </h3>
              <p className="text-sm text-slate-300 font-semibold">{studentProfile.school}</p>
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                <GraduationCap className="h-4 w-4 text-[var(--accent2)]" /> {studentProfile.grade}
              </p>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Interests & Subjects */}
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-sky-400" /> Interests & Subjects
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {studentProfile.interests.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No interests added yet.</p>
                    ) : (
                      studentProfile.interests.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs font-bold">
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Subjects Enjoyed</p>
                  <div className="flex flex-wrap gap-1.5">
                    {studentProfile.subjects.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No subjects added yet.</p>
                    ) : (
                      studentProfile.subjects.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 text-xs font-bold">
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Skills & Languages */}
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400" /> Skills & Languages
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {studentProfile.skills.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No skills added yet.</p>
                    ) : (
                      studentProfile.skills.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {studentProfile.languages.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No languages added yet.</p>
                    ) : (
                      studentProfile.languages.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Activities (Hobbies, Sports, Clubs) */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-5 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Hobbies</h4>
              <div className="flex flex-wrap gap-1.5">
                {studentProfile.hobbies.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No hobbies added yet.</p>
                ) : (
                  studentProfile.hobbies.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 text-xs font-bold">
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </Card>
            <Card className="p-5 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sports</h4>
              <div className="flex flex-wrap gap-1.5">
                {studentProfile.sports.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No sports added yet.</p>
                ) : (
                  studentProfile.sports.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 text-xs font-bold">
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </Card>
            <Card className="p-5 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">School Clubs</h4>
              <div className="space-y-1.5">
                {studentProfile.clubs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No clubs joined yet.</p>
                ) : (
                  studentProfile.clubs.map((club) => (
                    <div key={club.id} className="text-xs">
                      <p className="font-bold text-white">{club.title}</p>
                      <p className="text-[10px] text-slate-400">{club.subtitle}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Achievements & Milestones */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Certifications & Achievements */}
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-blue-400" /> Certifications & Achievements
              </h3>
              <div className="space-y-3">
                {studentProfile.certifications.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <Award className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.subtitle} · {item.date}</p>
                    </div>
                  </div>
                ))}
                {studentProfile.achievements.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <Trophy className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.subtitle} · {item.date} {item.meta ? `(${item.meta})` : ''}</p>
                    </div>
                  </div>
                ))}
                {studentProfile.certifications.length === 0 && studentProfile.achievements.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No certifications or achievements added yet.</p>
                )}
              </div>
            </Card>

            {/* Projects & Milestones */}
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-indigo-400" /> Projects & Milestones
              </h3>
              <div className="space-y-3">
                {studentProfile.projects.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <Briefcase className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.subtitle} · {item.date}</p>
                    </div>
                  </div>
                ))}
                {studentProfile.milestones.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <Calendar className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.date}</p>
                    </div>
                  </div>
                ))}
                {studentProfile.projects.length === 0 && studentProfile.milestones.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No projects or milestones added yet.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Competitions Feed (Auto-fed from Orbit Competitions) */}
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-emerald-400" /> Competitions Activity Loop
            </h3>
            <div className="space-y-3">
              {studentProfile.competitions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No competitions participated in yet. Go to the Competitions tab to discover and register!</p>
              ) : (
                studentProfile.competitions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-start gap-2.5">
                      <Trophy className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">{item.title}</p>
                        <p className="text-[10px] text-slate-400">{item.subtitle} · {item.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {item.meta}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      <ConfidentialDocsSection />
    </Panel>
  )
}
