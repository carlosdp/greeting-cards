create table asset_generation_requests (
  id uuid primary key default gen_random_uuid(),
  style varchar not null,
  description text not null,
  expected_asset_count integer not null,
  completed boolean not null default false,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  asset_generation_request_id uuid not null references asset_generation_requests(id),
  storage_key varchar not null
);