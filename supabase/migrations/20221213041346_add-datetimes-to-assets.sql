alter table assets add column created_at timestamptz not null default now();
alter table assets add column updated_at timestamptz not null default now();