-- Gearhood: owner registration database
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
--
-- Security model:
--   * Row Level Security is ON for both tables with NO public policies,
--     so the public (anon key) can never read or change rows directly.
--   * The website can only call register_owner(), which validates input
--     and inserts one owner plus their items in a single step.
--   * You see and manage everything in the Supabase dashboard (Table Editor).

create table if not exists public.owners (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  first_name      text not null check (char_length(first_name) between 1 and 60),
  whatsapp        text not null check (whatsapp ~ '^\+?[0-9 ]{9,16}$'),
  suburb          text not null check (char_length(suburb) between 2 and 60),
  referral_code   text not null unique,
  referred_by     text,
  founding_owner  boolean not null default true,
  consent_at      timestamptz not null,
  status          text not null default 'registered'
                  check (status in ('registered','contacted','photo_booked','active','declined')),
  notes           text
);

create table if not exists public.items (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  owner_id            uuid not null references public.owners(id) on delete cascade,
  name                text not null check (char_length(name) between 2 and 80),
  category            text not null
                      check (category in ('Camping','Beach','Baby & kids','Party','Tools','Other')),
  approx_value        integer not null check (approx_value between 100 and 15000),
  suggested_day_rate  integer not null,
  status              text not null default 'registered'
                      check (status in ('registered','photo_booked','live','rejected'))
);

create index if not exists items_owner_idx on public.items(owner_id);

alter table public.owners enable row level security;
alter table public.items  enable row level security;
-- No policies on purpose: anon and authenticated users get no direct access.

create or replace function public.register_owner(
  p_first_name  text,
  p_whatsapp    text,
  p_suburb      text,
  p_referred_by text,
  p_consent     boolean,
  p_items       jsonb
) returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_owner  uuid;
  v_code   text;
  v_item   jsonb;
  v_count  int;
  v_value  int;
begin
  if not coalesce(p_consent, false) then
    raise exception 'consent_required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'items_required';
  end if;
  v_count := jsonb_array_length(p_items);
  if v_count < 1 or v_count > 5 then
    raise exception 'items_count';
  end if;

  if exists (
    select 1 from public.owners
    where regexp_replace(whatsapp, '\D', '', 'g') = regexp_replace(p_whatsapp, '\D', '', 'g')
  ) then
    raise exception 'already_registered';
  end if;

  loop
    v_code := upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    exit when not exists (select 1 from public.owners where referral_code = v_code);
  end loop;

  insert into public.owners (first_name, whatsapp, suburb, referral_code, referred_by, consent_at)
  values (trim(p_first_name), trim(p_whatsapp), trim(p_suburb), v_code,
          nullif(upper(trim(coalesce(p_referred_by, ''))), ''), now())
  returning id into v_owner;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_value := (v_item->>'value')::int;
    insert into public.items (owner_id, name, category, approx_value, suggested_day_rate)
    values (v_owner, trim(v_item->>'name'), v_item->>'category', v_value,
            greatest(10, (round(v_value * 0.04 / 5) * 5)::int));
  end loop;

  return v_code;
end;
$$;

revoke all on function public.register_owner(text, text, text, text, boolean, jsonb) from public;
grant execute on function public.register_owner(text, text, text, text, boolean, jsonb) to anon, authenticated;

-- Handy view for you (not exposed to the public: only the dashboard and service role can read it)
create or replace view public.owner_items as
  select o.created_at, o.first_name, o.whatsapp, o.suburb, o.status as owner_status,
         o.referral_code, o.referred_by,
         i.name as item, i.category, i.approx_value, i.suggested_day_rate, i.status as item_status
  from public.owners o
  join public.items i on i.owner_id = o.id
  order by o.created_at desc;

revoke all on public.owner_items from anon, authenticated;
