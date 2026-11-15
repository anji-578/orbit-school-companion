-- Close sql-security isolation sweep gaps: catalog tables created without RLS.
-- Idempotent: safe when tables were never provisioned on a given project.

do $$
begin
  if to_regclass('public.data_processing_purposes') is not null then
    execute 'alter table public.data_processing_purposes enable row level security';
    execute 'drop policy if exists data_processing_purposes_select_authenticated on public.data_processing_purposes';
    execute $p$
      create policy data_processing_purposes_select_authenticated
        on public.data_processing_purposes
        for select
        to authenticated
        using (true)
    $p$;
    execute 'revoke insert, update, delete on public.data_processing_purposes from authenticated, anon';
  end if;

  if to_regclass('public.questions') is not null then
    execute 'alter table public.questions enable row level security';
    execute 'drop policy if exists questions_select_authenticated on public.questions';
    execute $p$
      create policy questions_select_authenticated
        on public.questions
        for select
        to authenticated
        using (true)
    $p$;
    execute 'revoke insert, update, delete on public.questions from authenticated, anon';
  end if;

  if to_regclass('public.question_skills') is not null then
    execute 'alter table public.question_skills enable row level security';
    execute 'drop policy if exists question_skills_select_authenticated on public.question_skills';
    execute $p$
      create policy question_skills_select_authenticated
        on public.question_skills
        for select
        to authenticated
        using (true)
    $p$;
    execute 'revoke insert, update, delete on public.question_skills from authenticated, anon';
  end if;
end $$;
