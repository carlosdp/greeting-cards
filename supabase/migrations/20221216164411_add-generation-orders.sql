create table generation_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_payment_intent_id varchar,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table generation_orders enable row level security;

alter table assets add column generation_order_id uuid references generation_orders(id);