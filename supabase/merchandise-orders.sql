-- ════════════════════════════════════════════════════════════════════════
--  PNTC website: Merchandise orders
--  Run once in the current Supabase project: SQL Editor > New query > paste all > Run.
--  Safe to run again. (A new project gets this from schema.sql already.)
-- ════════════════════════════════════════════════════════════════════════

-- one row per order from the Merchandise page. The order number shown to buyers is M- followed by order_no.
create table if not exists merch_orders (
  id              uuid          primary key default gen_random_uuid(),
  order_no        bigint        generated always as identity (start with 1001) unique,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now(),
  item_id         uuid,
  item_name       text,
  size            text,
  quantity        int           not null default 1,
  unit_price      numeric(10,2),
  total           numeric(10,2),
  buyer_type      text,          -- student or employee
  name            text,
  email           text,
  phone           text,
  id_number       text,          -- student number or employee ID
  department      text,          -- course and year, or office
  payment_method  text,          -- finance (pay at the Finance Office) or salary (salary deduction, employees only)
  notes           text,          -- from the buyer
  status          text          not null default 'placed',  -- placed, confirmed, ongoing, ready, completed, cancelled
  staff_notes     text,          -- Finance and Purchasing only
  history         jsonb         default '[]'::jsonb          -- each status change: status, time and who
);
create index if not exists merch_orders_created_idx on merch_orders (created_at desc);
create index if not exists merch_orders_status_idx  on merch_orders (status, created_at desc);
create index if not exists merch_orders_track_idx   on merch_orders (order_no, email);

-- only the admin server (service_role key) may read or write it
alter table merch_orders enable row level security;
