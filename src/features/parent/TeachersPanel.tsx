import { Phone } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/DemoNotice'

export function TeachersPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const teachers = useOrbitStore((s) => s.teachers)
  const showingSampleData = useOrbitStore((s) => s.showingSampleData)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const t = (key: string) => translate(lang, key)

  return (
    <Panel title={t('childTeachersTab')} subtitle={t('childTeachersDesc')}>
      {showingSampleData ? <DemoNotice detailKey="demoTeachersHint" /> : null}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={teacher.avatar}
                alt=""
                className="h-12 w-12 rounded-full object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{teacher.name}</h3>
                <Eyebrow>{t(teacher.subjectKey)}</Eyebrow>
              </div>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <p>
                <span className="text-slate-500">{t('teacherQualTitle')}: </span>
                {teacher.qualification}
              </p>
              <p>
                <span className="text-slate-500">{t('teacherPhoneTitle')}: </span>
                {teacher.phone}
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerToast(`${t('teacherCallingToast')} ${teacher.name}`)}
              className="btn-accent w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {t('teacherCallAction')}
            </button>
          </Card>
        ))}
      </div>
    </Panel>
  )
}
