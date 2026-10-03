import { envFirst } from './env.js'
import { demoEnsureDecision } from './aiGuards.js'

/** Demo user provisioning is never allowed on Vercel production. */
export function demoEnsureAllowed(): boolean {
  return demoEnsureDecision(envFirst('VERCEL_ENV'), envFirst('ORBIT_ALLOW_DEMO_ENSURE'))
}
