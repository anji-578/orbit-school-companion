import { useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { redeemInviteCode } from '../../lib/classLink'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { EmptyState } from './EmptyState'

/** Invite redeem UI for accounts that are not class-linked yet. */
export function InviteRedeemCard() {
  const lang = useOrbitStore((s) => s.lang)
  const hydrateFromSupabase = useOrbitStore((s) => s.hydrateFromSupabase)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = (key: string) => translate(lang, key)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await redeemInviteCode(code)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    triggerToast(t('inviteRedeemedToast'))
    setCode('')
    await hydrateFromSupabase()
  }

  return (
    <EmptyState
      title={t('noClassLinkedTitle')}
      description={t('noClassLinkedDesc')}
      icon={<KeyRound className="h-5 w-5" aria-hidden />}
      action={
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-2 text-left">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('inviteCode')}</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="field w-full rounded-xl px-3 py-2.5 text-sm"
              placeholder={t('inviteCodePlaceholder')}
              autoComplete="off"
              required
            />
          </label>
          {error ? (
            <p className="text-[11px] text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={loading} className="btn-accent w-full rounded-xl py-2.5 text-xs font-bold">
            {loading ? t('redeemingInvite') : t('redeemInvite')}
          </button>
        </form>
      }
    />
  )
}
