create table if not exists public.registrations (
  id serial primary key,
  booking_id text not null unique,
  name text not null,
  email text not null,
  phone text not null,
  total_passes integer not null default 1,
  payment_screenshot text,
  payment_status text not null default 'pending',
  created_at timestamp with time zone not null default now()
);

create table if not exists public.participants (
  id serial primary key,
  registration_id integer not null references public.registrations (id) on delete cascade,
  participant_name text not null,
  age integer,
  college_or_company text,
  pass_id text,
  qr_token text unique,
  is_used boolean not null default false
);

create index if not exists participants_registration_id_idx on public.participants (registration_id);
create index if not exists participants_qr_token_idx on public.participants (qr_token);
create index if not exists registrations_payment_status_idx on public.registrations (payment_status);
create index if not exists registrations_created_at_idx on public.registrations (created_at);