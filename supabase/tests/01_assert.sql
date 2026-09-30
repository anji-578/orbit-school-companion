-- Assert helpers (SQL, no pgTAP required). RAISE EXCEPTION fails the run.

create or replace function public.test_assert(condition boolean, message text)
returns void
language plpgsql
as $$
begin
  if not condition then
    raise exception 'ASSERT FAILED: %', message;
  end if;
end;
$$;
