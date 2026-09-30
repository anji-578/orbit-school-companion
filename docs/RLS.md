# Orbit — RLS policy matrix

Engineering document. Apply and verify against **local** Supabase only.

## Core identity

| Table | SELECT | INSERT | UPDATE | DELETE |
|--|--|--|--|--|
| `schools` | authenticated (scoped) | school | school | school |
| `profiles` | self + school staff | signup path | self / school | school |
| `students` | linked student / parent / staff in school | school / import | staff or self-claim | school |
| `parent_links` | parent / linked student / staff | parent self / school | school | school |

## Learning / ops (student-relevant)

| Table | SELECT | INSERT | UPDATE | DELETE |
|--|--|--|--|--|
| `attendance` | linked roles in school | teacher/school (+ offline queue) | teacher/school | school |
| `homework` / completions | school-scoped | teacher/school; student completes own | same | school |
| `xp_events` | own student only | via `award_xp` RPC only | none | none |
| `student_badges` | own student only | via `award_xp` | none | none |
| `consents` | subject / guardian | guardian / school | withdraw path | school |
| `attempts` | own student | own student (flagged) | none | school |
| `mastery_state` | own student | server / RPC | server / RPC | school |
| `review_schedule` | own student | server / RPC | server / RPC | school |

## Storage

| Bucket | Access |
|--|--|
| notes / scans | private; signed URLs; size/type limits at upload Edge |

## Automated proof (local)

```bash
# When local Supabase is running:
# supabase test db   # or pgTAP suite under supabase/tests/
```

Minimum assertions:

1. Student A cannot `select` student B's `xp_events` / `attempts`.
2. Unlinked student sees no school-scoped homework/attendance.
3. Parent of A cannot read B.
4. Anon role cannot call `award_xp` successfully for arbitrary ids without auth.

Deferred: full pgTAP suite in CI (requires local Supabase service in the pipeline).
