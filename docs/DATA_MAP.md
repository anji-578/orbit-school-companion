# Orbit — data map

| Element | Stored | Purpose | Retention | Processors |
|--|--|--|--|--|
| Auth email / session | Supabase Auth | operations | account lifetime | Supabase |
| Student roster (name, class, roll) | `students` | operations | school tenure + soft-deactivate | Supabase |
| Attendance marks | `attendance` | operations / learning_support | academic year + 1 | Supabase |
| Homework + completions | school ops tables | learning_support | academic year + 1 | Supabase |
| XP events / badges | `xp_events`, `student_badges` | learning_support | academic year + 1 | Supabase |
| AI prompts / responses | server logs (short TTL) | learning_support / product_quality | see RETENTION.md | Vercel, Gemini |
| Scan images | Storage (private) | learning_support | short TTL | Supabase Storage, Gemini |
| Consents | `consents` | operations / legal basis | until withdrawn + audit window | Supabase |
| Attempts / mastery | `attempts`, `mastery_state` | learning_support | academic year + 1 | Supabase |
| Push tokens | device token table (planned) | operations | until logout / revoke | FCM / web-push |
| Error events | Sentry (staging+) | product_quality | vendor default | Sentry |
| Analytics events | analytics sink (staging+) | purpose-tagged | 13 months | analytics vendor |

Export: `export_student_data` RPC. Erasure: `anonymize_student` (school role) + Storage cleanup job (documented in RUNBOOK).
