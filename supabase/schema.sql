-- Fidelity SaaS schema
create extension if not exists "pgcrypto";

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  logo_url text,
  is_active boolean not null default true,
  plan text not null default 'gratuit', -- gratuit | solo | pro
  suspended_at timestamptz,
  suspended_reason text,
  created_at timestamptz default now()
);

-- Migration safe-add (si la table existait déjà sans ces colonnes)
alter table businesses add column if not exists is_active boolean not null default true;
alter table businesses add column if not exists plan text not null default 'gratuit';
alter table businesses add column if not exists suspended_at timestamptz;
alter table businesses add column if not exists suspended_reason text;

create table if not exists admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  target_business_id uuid references businesses(id) on delete set null,
  meta jsonb,
  created_at timestamptz default now()
);
create index if not exists admin_logs_created_idx on admin_logs(created_at desc);
create index if not exists businesses_owner_idx on businesses(owner_id);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null default 'Carte principale',
  mechanic text not null default 'stamp', -- 'stamp' | 'points'
  stamps_required int default 10,
  reward_label text default 'Un produit offert',
  points_per_euro int default 1,
  points_for_reward int default 100,
  primary_color text default '#7B1E2B',
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists cards_business_idx on cards(business_id);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  qr_code text unique not null default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz default now()
);
create index if not exists customers_business_idx on customers(business_id);
create index if not exists customers_qr_idx on customers(qr_code);

create table if not exists customer_cards (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  stamps int not null default 0,
  points int not null default 0,
  rewards_claimed int not null default 0,
  last_visit_at timestamptz,
  created_at timestamptz default now(),
  unique (customer_id, card_id)
);
create index if not exists customer_cards_customer_idx on customer_cards(customer_id);

create table if not exists activity (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  card_id uuid references cards(id) on delete cascade,
  kind text not null, -- 'stamp' | 'points' | 'reward'
  amount int default 1,
  note text,
  created_at timestamptz default now()
);
create index if not exists activity_business_idx on activity(business_id, created_at desc);

-- RLS
alter table businesses enable row level security;
alter table cards enable row level security;
alter table customers enable row level security;
alter table customer_cards enable row level security;
alter table activity enable row level security;

create policy "owner_businesses" on businesses for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner_cards" on cards for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "owner_customers" on customers for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "owner_customer_cards" on customer_cards for all
  using (card_id in (select c.id from cards c join businesses b on b.id = c.business_id where b.owner_id = auth.uid()))
  with check (card_id in (select c.id from cards c join businesses b on b.id = c.business_id where b.owner_id = auth.uid()));

create policy "owner_activity" on activity for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));
