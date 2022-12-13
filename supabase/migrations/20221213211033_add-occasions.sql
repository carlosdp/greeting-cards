create table occasions (
  id varchar primary key,
  name varchar not null,
  prompt varchar not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table asset_generation_requests add column occasion_id varchar references occasions(id);

alter table occasions enable row level security;

create policy "Allow anon reads for occasions table" on occasions for select using (true);