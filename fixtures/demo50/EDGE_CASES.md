# DEMO50 edge cases & attributed scenarios

School: **Sunrise Demo Academy** (`DEMO50`)  
Shared password: `Demo50!`  
Domain: `@demo50.orbit.app`

## Students with special scenarios

| idx | Name | Class | Edge case | Demo tag |
|--|--|--|--|--|
| 1 | Aarav D'Souza | Grade 5-A | `apostrophe_surname` | `name_special_chars` |
| 2 | Mary-Anne Joseph | Grade 5-A | `hyphenated_given` | `name_special_chars` |
| 3 | Muhammad Ibrahim Al-Hassan | Grade 5-A | `long_multi_part_name` | `name_special_chars` |
| 4 | Chinnu | Grade 5-A | `single_word_name` | `name_special_chars` |
| 5 | Ñisha O'Brien | Grade 5-A | `unicode_name` | `name_special_chars` |
| 6 | Ira Rao | Grade 5 | `empty_section` | `roster_edge` |
| 7 | Karthik Patel | Grade 5-A | `non_sequential_roll` | `roster_edge` |
| 8 | Priya Sharma | Grade 5-A | `duplicate_name_a` | `duplicate_name` |
| 9 | Meera Menon | Grade 6-A | `sibling_group_a_child2` | `multi_child_parent` |
| 11 | Dev Shetty | Grade 6-A | `no_fees` | `fees_none` |
| 12 | Rahul Nair | Grade 6-A | `all_fees_paid` | `fees_paid` |
| 13 | Sneha Das | Grade 6-A | `overdue_fees` | `fees_overdue` |
| 14 | Tanvi Rao | Grade 6-A | `pending_utr` | `fees_pending` |
| 15 | Lakshmi Patel | Grade 6-A | `transport_fee_only` | `fees_transport_only` |
| 19 | Priya Sharma | Grade 7-A | `duplicate_name_b` | `duplicate_name` |
| 21 | Shruti Singh | Grade 8-A | `sibling_group_a_child1` | `multi_child_parent` |
| 22 | Kiran Mehta | Grade 7-A | `sibling_group_b_child1` | `two_siblings_same_grade` |
| 23 | Vivaan Sharma | Grade 7-A | `sibling_group_b_child2` | `two_siblings_same_grade` |
| 24 | Arjun Menon | Grade 7-A | `chronic_absent` | `attendance_low` |
| 25 | Krishna Mukherjee | Grade 7-A | `perfect_attendance` | `attendance_perfect` |
| 26 | Ananya Shetty | Grade 7-A | `weak_math` | `marks_struggle` |
| 27 | Myra Nair | Grade 7-A | `topper` | `marks_excellent` |
| 28 | Kiara Das | Grade 7-A | `homework_pressure` | `homework_incomplete` |
| 30 | Diya Mukherjee | Grade 8-A | `unlinked_no_parent` | `no_parent_link` |
| 31 | Anika Shetty | Grade 8-A | `parent_no_student_login` | `parent_only_login` |
| 32 | కృష్ణ రెడ్డి | Grade 8-A | `telugu_script_name` | `i18n_name` |
| 33 | अनिका शर्मा | Grade 8-A | `hindi_script_name` | `i18n_name` |
| 40 | Manoj Mukherjee | Grade 8-A | `gk_quiz_champion` | `student_gk_quiz` |
| 41 | Kavya Menon | Grade 8-B | `competition_enrolled` | `student_competition` |
| 42 | Harini Mukherjee | Grade 8-B | `confidential_docs` | `student_vault` |
| 46 | Neha Banerjee | Grade 9-A | `sibling_group_a_child3` | `multi_child_parent` |
| 48 | Sahana Reddy | Grade 9-A | `bus_tracker_demo` | `parent_transport` |
| 50 | Zara Khan | Grade 9-A | `last_roster_row` | `roster_end` |

## Sibling groups
- **parent001** (Suresh Rao): students 21, 9, 46 (3 children)
- **parent002** (Lakshmi Iyer): students 22, 23 (same grade)

## Unlinked / auth exceptions
- Student **30**: roster only, no parent link
- Student **31**: parent login only (no student031 login)

## Teachers
- **Mrs. Kavitha Reddy** (`teacher01@demo50.orbit.app`) — Grade 8-A|Grade 5-A|Grade 8-B
- **Mr. Arun Menon** (`teacher02@demo50.orbit.app`) — Grade 7-A|Grade 8-A
- **Ms. Fatima Khan** (`teacher03@demo50.orbit.app`) — Grade 6-A|Grade 5-A
- **Mr. Suresh Pillai** (`teacher04@demo50.orbit.app`) — Grade 9-A|Grade 8-A
- **Mrs. Anjali Deshmukh** (`teacher05@demo50.orbit.app`) — Grade 8-B|Grade 7-A
