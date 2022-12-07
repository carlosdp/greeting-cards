create table orders (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets(id),
  message text not null,
  name varchar not null,
  line1 varchar not null,
  line2 varchar,
  city varchar not null,
  state varchar not null,
  postal_code varchar not null,
  country varchar not null,
  stripe_payment_intent_id varchar,
  prodigi_order_id varchar,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);