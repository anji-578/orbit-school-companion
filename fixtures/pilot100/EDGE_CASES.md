# PILOT100 edge cases

School: **Orbit Pilot Academy** (`PILOT100`)  
Shared password: `Pilot100!`

| idx | Edge case | Why |
|--|--|--|
| 1 | `apostrophe_surname` | Aarav D'Souza · Grade 6-A |
| 2 | `hyphenated_given` | Mary-Anne Joseph · Grade 6-A |
| 3 | `long_multi_part_name` | Muhammad Ibrahim Al-Hassan · Grade 6-A |
| 4 | `single_word_name` | Chinnu · Grade 6-A |
| 5 | `leading_trailing_spaces` | Spaced Name Test · Grade 6-A |
| 6 | `unicode_and_escape` | Ñisha O'Brien · Grade 6-A |
| 7 | `empty_section` | Saanvi Sen · Grade 6-none |
| 8 | `non_sequential_roll` | Anika Patel · Grade 6-A |
| 9 | `roll_without_leading_zero` | Navya Menon · Grade 6-A |
| 10 | `duplicate_common_name_a` | Priya Sharma · Grade 6-A |
| 11 | `sibling_group_a_child1` | Nikhil Joshi · Grade 8-A |
| 12 | `sibling_group_a_child2` | Varun Rao · Grade 6-A |
| 13 | `sibling_group_a_child3` | Dev Hegde · Grade 9-A |
| 21 | `sibling_group_b_child1` | Varun Menon · Grade 7-A |
| 22 | `sibling_group_b_child2` | Dev Das · Grade 7-A |
| 30 | `no_fees` | Gayatri Mukherjee · Grade 6-B |
| 31 | `all_fees_paid` | Radha Kapoor · Grade 6-B |
| 32 | `overdue_fees` | Tejas Pillai · Grade 6-B |
| 33 | `pending_utr` | Manoj Deshmukh · Grade 6-B |
| 40 | `chronic_absent` | Tejas Menon · Grade 7-A |
| 41 | `perfect_attendance` | Manoj Das · Grade 7-A |
| 50 | `unlinked_no_parent` | Anika Kapoor · Grade 7-A |
| 51 | `student_login_only` | Navya Pillai · Grade 7-A |
| 55 | `duplicate_common_name_b` | Priya Sharma · Grade 8-A |
| 60 | `parent_no_student_login` | Navya Singh · Grade 8-A |
| 70 | `telugu_script_name` | కృష్ణ రెడ్డి · Grade 8-A |
| 71 | `hindi_script_name` | अनिका शर्मा · Grade 8-A |
| 80 | `transport_fee_only` | Tanvi Singh · Grade 8-B |
| 90 | `class_outside_main_policy` | Gayatri Patel · Grade 10-A |
| 100 | `last_roster_row` | Zara Khan · Grade 9-A |

## Sibling groups
- Parent of students 11,12,13 (3 children across grades)
- Parent of students 21,22 (2 children same grade)

## Unlinked
- Student 50: roster only, no parent link

## Auth note
Run `node scripts/provision-pilot100.mjs` after SQL seed to create Auth users + profile links.
Teardown: `node scripts/teardown-pilot100.mjs`
