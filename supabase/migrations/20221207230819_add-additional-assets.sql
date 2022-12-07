alter table assets add column "prompt" varchar;
alter table assets add column "instruction" varchar;

alter table orders add column "print_asset_key" varchar;