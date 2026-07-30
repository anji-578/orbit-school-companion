import { Award, Lock, Trophy, Zap } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { ALL_BADGES } from '../../data/demo'
import { Panel, Card, StatTile, ProgressBar } from '../../components/ui/primitives'

const XP_PER_LEVEL = 200

export function AchievementsPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const totalXp = useOrbitStore((s) => s.totalXp)
  const unlockedBadges = useOrbitStore((s) => s.unlockedBadges)

  const t = (key: string) => translate(lang, key)
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const xpIntoLevel = totalXp % XP_PER_LEVEL
  const levelPercent = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100)

  return (
    <Panel title={t('achievementsTitle')} subtitle={t('achievementsDesc')}>
      <div className="grid sm:grid-cols-2 gap-4">
        <StatTile label="Total XP" value={String(totalXp)} hint={`${unlockedBadges.length}/${ALL_BADGES.length} badges unlocked`} accent="var(--accent2)" />
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" aria-hidden /> {t('levelLabel')} {level}
            </span>
            <span className="text-[10px] text-slate-400">
              {xpIntoLevel}/{XP_PER_LEVEL} XP
            </span>
          </div>
          <ProgressBar value={levelPercent} />
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_BADGES.map((badge) => {
          const unlocked = unlockedBadges.includes(badge.name)
          return (
            <Card key={badge.name} className={`p-4 space-y-2 ${unlocked ? '' : 'opacity-55'}`}>
              <div className="flex items-center justify-between">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    unlocked ? 'accent-soft' : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {unlocked ? (
                    <Trophy className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-500" aria-hidden />
                  )}
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${
                    unlocked
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                      : 'bg-white/5 text-slate-500 border-white/10'
                  }`}
                >
                  {unlocked ? t('unlocked') : t('locked')}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-slate-500" aria-hidden /> {badge.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">{badge.desc}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </Panel>
  )
}
