create table personas (
  id uuid primary key default uuid_generate_v4(),
  label varchar not null,
  prompt varchar not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table interests (
  id uuid primary key default uuid_generate_v4(),
  label varchar not null,
  prompt varchar not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table asset_generation_request_interests (
  asset_generation_request_id uuid references asset_generation_requests(id),
  interest_id uuid references interests(id),
  primary key (asset_generation_request_id, interest_id)
);

alter table asset_generation_requests add column persona_id uuid references personas(id);
