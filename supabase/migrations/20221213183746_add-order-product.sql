create type order_product as enum ('greeting_card', 'handwritten');

alter table orders add column product order_product not null default 'greeting_card';
alter table orders add column handwrytten_order_id varchar;