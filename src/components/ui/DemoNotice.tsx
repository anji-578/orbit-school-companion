import { translate } from '../../i18n'
import { useOrbitStore } from '../../store/orbitStore'

/** Soft label — sample/demo fill kept so teammate walkthroughs look complete. */
export function DemoNotice({ detailKey = 'demoSurfaceHint' }: { detailKey?: string }) {
  const lang = useOrbitStore((s) => s.lang)
  const t = (key: string) => translate(lang, key)
  return (
    <p className="text-[11px] text-sky-100/90 bg-sky-500/10 border border-sky-500/20 rounded-xl px-3 py-2">
      {t('demoSurfaceLabel')} · {t(detailKey)}
    </p>
  )
}
