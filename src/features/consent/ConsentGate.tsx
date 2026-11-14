import { useState, type ReactNode } from 'react'
import { getFlags } from '@/services/feature-flags'

const STORAGE_KEY = 'orbit-consent-ack-v1'
const POLICY_VERSION = '1.0'

function hasAck(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { version?: string }
    return parsed.version === POLICY_VERSION
  } catch {
    return false
  }
}

function saveAck(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: POLICY_VERSION, at: new Date().toISOString() }))
}

/**
 * First-run privacy acknowledgment for production builds.
 * Keeps existing product chrome; does not redesign the student shell.
 */
export function ConsentGate({ children }: { children: ReactNode }) {
  const required = getFlags().consentGate
  const [acked, setAcked] = useState(() => !required || hasAck())

  if (!required || acked) return children

  return (
    <div className="flex min-h-dvh items-center justify-center bg-o-bg p-6">
      <div className="w-full max-w-md space-y-4 rounded-card border border-o-border bg-o-surface p-5">
        <p className="font-display text-lg font-bold text-o-text">Before you continue</p>
        <p className="text-sm text-o-muted">
          Orbit helps with school learning. Your school controls education records. Review our privacy policy
          and terms, then continue.
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              className="text-o-primary underline"
              href="/legal/privacy.html"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a className="text-o-primary underline" href="/legal/terms.html" target="_blank" rel="noreferrer">
              Terms of Use
            </a>
          </li>
          <li>
            <a
              className="text-o-primary underline"
              href="/legal/delete-account.html"
              target="_blank"
              rel="noreferrer"
            >
              How to delete your account
            </a>
          </li>
        </ul>
        <button
          type="button"
          className="o-focus min-h-11 w-full rounded-button bg-o-primary px-4 text-sm font-semibold text-white"
          onClick={() => {
            saveAck()
            setAcked(true)
          }}
        >
          I understand — continue
        </button>
        <p className="text-[11px] text-o-faint">Policy version {POLICY_VERSION}</p>
      </div>
    </div>
  )
}
