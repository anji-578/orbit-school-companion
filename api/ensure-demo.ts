import { getAdmin } from './_lib/supabaseAdmin.js'

export const config = { runtime: 'nodejs' }

/** Hard-coded Sunrise demo personas — must stay in sync with src/auth/demoUsers.ts */
const DEMO_ACCOUNTS = [
  {
    role: 'student',
    email: 'student@orbit.app',
    password: 'student123',
    displayName: 'Ananya Rao',
    subtitle: 'Grade 8-A · Roll 14',
  },
  {
    role: 'parent',
    email: 'parent@orbit.app',
    password: 'parent123',
    displayName: 'Parent of Ananya',
    subtitle: 'Guardian · Grade 8-A',
  },
  {
    role: 'teacher',
    email: 'teacher@orbit.app',
    password: 'teacher123',
    displayName: 'Mrs. Sarah Davis',
    subtitle: 'Mathematics · Class Teacher Grade 8-A',
  },
  {
    role: 'school',
    email: 'admin@orbit.app',
    password: 'admin123',
    displayName: 'School Admin',
    subtitle: 'Sunrise Public School',
  },
] as const

function cors(res: Response) {
  const headers = new Headers(res.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return new Response(res.body, { status: res.status, headers })
}

function json(data: unknown, status = 200) {
  return cors(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }))
}

async function findUserIdByEmail(
  admin: NonNullable<ReturnType<typeof getAdmin>>,
  email: string,
): Promise<string | null> {
  const normalized = email.toLowerCase()
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const hit = data.users.find((u) => (u.email || '').toLowerCase() === normalized)
    if (hit?.id) return hit.id
    if (data.users.length < 200) break
  }
  return null
}

/**
 * Ensures a documented demo account exists in Supabase Auth with the known password.
 * Only accepts exact DEMO_ACCOUNTS credentials — never arbitrary emails/passwords.
 */
export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const admin = getAdmin()
  if (!admin) return json({ error: 'Demo ensure unavailable (missing service role).' }, 503)

  let body: { email?: string; password?: string; role?: string }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''
  const role = body.role || ''
  const demo = DEMO_ACCOUNTS.find((d) => d.email === email && d.password === password && d.role === role)
  if (!demo) {
    return json({ error: 'Not a documented demo account.' }, 403)
  }

  const meta = {
    role: demo.role,
    display_name: demo.displayName,
    subtitle: demo.subtitle,
  }

  try {
    const existingId = await findUserIdByEmail(admin, demo.email)
    let userId = existingId

    if (existingId) {
      const { error } = await admin.auth.admin.updateUserById(existingId, {
        password: demo.password,
        email_confirm: true,
        user_metadata: meta,
      })
      if (error) return json({ error: error.message }, 500)
    } else {
      const created = await admin.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: meta,
      })
      if (created.error || !created.data.user?.id) {
        return json({ error: created.error?.message || 'Could not create demo user.' }, 500)
      }
      userId = created.data.user.id
    }

    if (!userId) return json({ error: 'Demo user id missing.' }, 500)

    const stamp = new Date().toISOString()
    const { data: school } = await admin.from('schools').select('id').eq('code', 'SUNRISE').maybeSingle()
    const schoolId = (school?.id as string | undefined) ?? null

    const { data: existingProfile } = await admin.from('profiles').select('id, role, school_id').eq('id', userId).maybeSingle()
    if (existingProfile?.id) {
      await admin
        .from('profiles')
        .update({
          display_name: demo.displayName,
          subtitle: demo.subtitle,
          email: demo.email,
          school_id: existingProfile.school_id || schoolId,
          updated_at: stamp,
        })
        .eq('id', userId)
    } else {
      await admin.from('profiles').insert({
        id: userId,
        role: demo.role,
        display_name: demo.displayName,
        subtitle: demo.subtitle,
        email: demo.email,
        school_id: schoolId,
        updated_at: stamp,
      })
    }

    if (demo.role === 'teacher' && schoolId) {
      await admin.from('teacher_classes').upsert(
        {
          school_id: schoolId,
          teacher_profile_id: userId,
          class_name: 'Grade 8',
          section: 'A',
        },
        { onConflict: 'teacher_profile_id,class_name,section' },
      )
    }

    return json({ ok: true, email: demo.email, role: demo.role })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ensure demo failed'
    return json({ error: message }, 500)
  }
}
