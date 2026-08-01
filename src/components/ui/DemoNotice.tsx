import { translate } from '../../i18n'
import { useOrbitStore } from '../../store/orbitStore'

/** Honest label for surfaces that are still simulated / not cloud-backed. */
export function DemoNotice({ detailKey = 'demoSurfaceHint' }: { detailKey?: string }) {
  const lang = useOrbitStore((s) => s.lang)
  const t = (key: string) => translate(lang, key)
  return (
    <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
      {t('demoSurfaceLabel')} · {t(detailKey)}
    </p>
  )
}
