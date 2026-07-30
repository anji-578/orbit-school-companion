import type { Role } from '../types'

export interface LocalAccount {
  id: string
  role: Role
  email: string
  password: string
  displayName: string
  subtitle: string
}

const STORAGE_KEY = 'orbit-local-accounts-v1'

function readAll(): LocalAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(accounts: LocalAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

export function findLocalAccount(role: Role, email: string, password: string): LocalAccount | null {
  const normalized = email.trim().toLowerCase()
  const account = readAll().find((a) => a.role === role && a.email === normalized)
  if (!account || account.password !== password) return null
  return account
}

export function createLocalAccount(input: {
  role: Role
  email: string
  password: string
  displayName: string
  subtitle: string
}): { ok: true; account: LocalAccount } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase()
  if (input.password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }
  const existing = readAll()
  if (existing.some((a) => a.email === email)) {
    return { ok: false, error: 'An account with this email already exists. Sign in instead.' }
  }
  const account: LocalAccount = {
    id: `local_${Date.now()}`,
    role: input.role,
    email,
    password: input.password,
    displayName: input.displayName.trim() || email.split('@')[0] || 'Orbit User',
    subtitle: input.subtitle,
  }
  writeAll([account, ...existing])
  return { ok: true, account }
}
