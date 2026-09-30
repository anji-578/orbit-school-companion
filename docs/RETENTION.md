# Orbit — retention policy (engineering defaults)

| Data class | Default TTL | Notes |
|--|--|--|
| AI request/response logs | **30 days** | PII-redacted; shorter in staging |
| Scan images in Storage | **14 days** unless teacher pins | Cron / lifecycle rule |
| Offline mutation queue (client) | until flush or 5 failed attempts | localStorage |
| Nav stack persist | **12 hours** TTL | `orbit-student-nav-v1` |
| XP / attendance / grades | academic year + 1 year | school policy may extend |
| Consents | until withdrawn + 3 years evidence | legal review pending |
| Error tracker events | vendor default (≤90 days recommended) | scrub PII |

Jobs: document cron in RUNBOOK; do not run against production from developer machines.
