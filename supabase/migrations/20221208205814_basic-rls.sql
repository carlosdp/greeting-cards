-- asset_generation_requests
alter table asset_generation_requests enable row level security;

create policy "Anons can read from asset_generation_requests" on asset_generation_requests for select using (true);

-- assets
alter table assets enable row level security;

create policy "Anons can read from assets" on assets for select using (true);

-- orders
alter table orders enable row level security;
