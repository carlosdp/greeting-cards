create table asset_generation_requests (
  id integer primary key generated always as identity,
  style varchar not null,
  description text not null,
  expected_asset_count integer not null,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp
);

create table assets (
  id integer primary key generated always as identity,
  asset_generation_request_id integer not null references asset_generation_requests(id),
  storage_key varchar not null
);