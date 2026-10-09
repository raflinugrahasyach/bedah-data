-- Bedah Data — Supabase (PostgreSQL) schema.
-- Run in the Supabase SQL editor, or `supabase db push` after copying into a migration.
--
-- Pipeline stages map to the product flow:
--   clients -> orders -> research_briefs (Tahap 1 intake) -> work_items (Tahap 4-5 delivery)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type order_status as enum ('pending', 'in_progress', 'qc', 'delivered');
create type payment_status as enum ('unpaid', 'paid', 'refunded');
create type analyst_status as enum ('not_started', 'in_progress', 'ready_for_qc', 'approved');

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------

create table clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 120),
  email      text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- orders
-- total_price is stored in whole rupiah (IDR has no minor unit in practice).
-- ---------------------------------------------------------------------------

create table orders (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references clients (id) on delete restrict,
  status         order_status not null default 'pending',
  total_price    integer not null check (total_price >= 0),
  payment_status payment_status not null default 'unpaid',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index orders_client_id_idx on orders (client_id);
create index orders_status_idx on orders (status);

-- ---------------------------------------------------------------------------
-- research_briefs — filled by the Tahap 1 consultative chatbot.
-- variables is jsonb: { "summary": text, "independent": text[], "dependent": text[] }
-- ---------------------------------------------------------------------------

create table research_briefs (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null unique references orders (id) on delete cascade,
  objective    text not null,
  variables    jsonb not null default '{}'::jsonb,
  data_profile text,
  method       text not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- work_items — the analyst's side of an order (Tahap 4 and 5).
-- deliverables is jsonb array of:
--   { "kind": "cleaned_data" | "syntax" | "report", "name": text, "size": int, "uploaded_at": timestamptz }
-- ---------------------------------------------------------------------------

create table work_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null unique references orders (id) on delete cascade,
  analyst_status analyst_status not null default 'not_started',
  deliverables   jsonb not null default '[]'::jsonb,
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

create trigger work_items_set_updated_at
  before update on work_items
  for each row execute function set_updated_at();

-- Every new order gets its analyst work item automatically.
create or replace function create_work_item_for_order() returns trigger
language plpgsql as $$
begin
  insert into work_items (order_id) values (new.id);
  return new;
end;
$$;

create trigger orders_create_work_item
  after insert on orders
  for each row execute function create_work_item_for_order();

-- ---------------------------------------------------------------------------
-- Row level security
-- All tables are locked down. The Next.js API routes use the service-role key
-- (server only), which bypasses RLS. Add explicit policies before exposing any
-- table to the anon key.
-- ---------------------------------------------------------------------------

alter table clients enable row level security;
alter table orders enable row level security;
alter table research_briefs enable row level security;
alter table work_items enable row level security;
