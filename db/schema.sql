-- Esquema da Granja Canaã. Idempotente: `npm run db:migrate` pode rodar
-- quantas vezes for preciso, em qualquer banco.

create table if not exists orders (
  id                  bigint generated always as identity primary key,
  -- Código curto que o cliente cita no WhatsApp. Gerado no servidor.
  code                text not null unique,
  status              text not null default 'recebido'
                      check (status in ('recebido', 'confirmado', 'em_rota', 'entregue', 'cancelado')),
  customer_name       text not null,
  address             text not null,
  reference           text,
  -- Faixa de entrega: data local da granja e hora de início da faixa.
  delivery_date       date not null,
  delivery_start_hour smallint not null,
  -- Rótulo exibido ao cliente no momento do pedido ("Hoje, 16 de set · 10h às 12h").
  slot_label          text not null,
  payment             text not null check (payment in ('pix', 'cartao', 'dinheiro')),
  change_for_cents    integer check (change_for_cents > 0),
  total_cents         integer not null check (total_cents > 0),
  created_at          timestamptz not null default now()
);

create index if not exists orders_delivery_idx on orders (delivery_date, delivery_start_hour);
create index if not exists orders_created_idx on orders (created_at desc);

create table if not exists order_items (
  order_id         bigint not null references orders (id) on delete cascade,
  product_id       text not null,
  -- Nome e preço congelados no pedido: mudar o catálogo não reescreve o passado.
  product_name     text not null,
  unit_price_cents integer not null check (unit_price_cents > 0),
  qty              integer not null check (qty between 1 and 20),
  primary key (order_id, product_id)
);
