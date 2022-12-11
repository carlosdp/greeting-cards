alter table personas enable row level security;

create policy "Anons can read from personas" on personas for select using (true);

alter table interests enable row level security;

create policy "Anons can read from interests" on interests for select using (true);

alter table message_styles enable row level security;

create policy "Anons can read from message_styles" on message_styles for select using (true);