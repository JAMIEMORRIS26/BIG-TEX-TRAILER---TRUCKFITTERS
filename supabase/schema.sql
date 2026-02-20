-- BIG-TEX-TRAILER---TRUCKFITTERS starter schema (RUN ONCE)

create extension if not exists "pgcrypto";

create type app_role as enum ('GENERAL_MANAGER','ADMIN','TRAILER_SALES','PARTS_SERVICE_SUPERVISOR','TECH');

create table if not exists app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'TECH',
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'NEW',
  customer_name text not null,
  customer_phone text,
  trailer_type text,
  axle_count int,
  axle_rating text,
  complaint text,
  created_by uuid references auth.users(id),
  assigned_tech uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references work_orders(id) on delete cascade,
  status text not null default 'DRAFT',
  customer_view_token text not null default encode(gen_random_bytes(16),'hex'),
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  shop_supplies numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists quote_lines (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  line_type text not null check (line_type in ('PART','LABOR','FEE')),
  sku text,
  description text not null,
  qty numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  taxable boolean not null default true,
  approved boolean,
  created_at timestamptz not null default now()
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  customer_name text not null,
  signature_text text not null,
  approved_at timestamptz not null default now()
);

create table if not exists parts (
  part_number text primary key,
  description text not null,
  category text,
  category_code int,
  sell_price numeric(12,2),
  cost numeric(12,2),
  location text,
  taxable boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function dashboard_stats()
returns table (new_count int, in_inspection int, needs_quote int, sent int, approved int)
language sql
security definer
as $$
  select
    (select count(*) from work_orders where status='NEW')::int as new_count,
    (select count(*) from work_orders where status='IN_INSPECTION')::int as in_inspection,
    (select count(*) from work_orders where status='NEEDS_QUOTE')::int as needs_quote,
    (select count(*) from work_orders where status='SENT')::int as sent,
    (select count(*) from work_orders where status='APPROVED')::int as approved;
$$;

alter table app_users enable row level security;
alter table work_orders enable row level security;
alter table quotes enable row level security;
alter table quote_lines enable row level security;
alter table approvals enable row level security;
alter table parts enable row level security;

create policy "auth read" on app_users for select to authenticated using (true);
create policy "auth upsert self" on app_users for insert to authenticated with check (id = auth.uid());
create policy "auth update self" on app_users for update to authenticated using (id = auth.uid());

create policy "auth rw" on work_orders for all to authenticated using (true) with check (true);
create policy "auth rw" on quotes for all to authenticated using (true) with check (true);
create policy "auth rw" on quote_lines for all to authenticated using (true) with check (true);
create policy "auth rw" on approvals for all to authenticated using (true) with check (true);
create policy "auth rw" on parts for all to authenticated using (true) with check (true);
