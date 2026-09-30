# Orbit — analytics event catalogue

All client events go through `track()` in `src/services/analytics`.

Every event has a **purpose** tag:

| Purpose | Meaning |
|--|--|
| `learning_support` | Helps the student learn |
| `safety` | Safeguarding |
| `product_quality` | Reliability / defects |
| `operations` | School ops / sync |

## Catalogue (v1)

| Event | Purpose | Properties (allowed) |
|--|--|--|
| `homework_started` | learning_support | `subject` (enum-like string), `taskId` (opaque) |
| `homework_completed` | learning_support | `subject`, `taskId` |
| `ask_orbit_opened` | learning_support | `hasSeed` (boolean) |
| `nav_tab_changed` | product_quality | `tab` |
| `offline_mutation_flushed` | operations | `kind`, `count` |

## Rules

- No free-text prompts, images, or raw PII.
- Pseudonymous student id only when required for product_quality.
- Engagement/retention-only events require an explicit approval note in the phase report.
