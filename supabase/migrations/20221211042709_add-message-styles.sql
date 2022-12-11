create table message_styles (
  id uuid primary key default gen_random_uuid(),
  label varchar not null,
  prompt varchar not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);