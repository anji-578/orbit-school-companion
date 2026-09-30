-- Data-subject export / erasure foundations (engineering only; legal review separate)

create or replace function public.export_student_data(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not exists (
    select 1 from public.students s
    where s.id = p_student_id
      and (s.profile_id = auth.uid()
           or exists (
             select 1 from public.parent_links pl
             where pl.student_id = s.id and pl.parent_profile_id = auth.uid()
           )
           or public.current_profile_role() in ('school'))
  ) then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'student', (select to_jsonb(s) from public.students s where s.id = p_student_id),
    'consents', coalesce((select jsonb_agg(to_jsonb(c)) from public.consents c where c.subject_student_id = p_student_id), '[]'::jsonb),
    'xp_events', coalesce((select jsonb_agg(to_jsonb(x)) from public.xp_events x where x.student_id = p_student_id), '[]'::jsonb),
    'attempts', coalesce((select jsonb_agg(to_jsonb(a)) from public.attempts a where a.student_id = p_student_id), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.export_student_data from public;
grant execute on function public.export_student_data to authenticated;

-- Soft anonymization placeholder — school role only
create or replace function public.anonymize_student(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_profile_role() <> 'school' then
    raise exception 'not authorized';
  end if;
  update public.students
    set display_name = 'Anonymized Student',
        profile_id = null
  where id = p_student_id;
  delete from public.consents where subject_student_id = p_student_id;
end;
$$;

revoke all on function public.anonymize_student from public;
grant execute on function public.anonymize_student to authenticated;
