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

-- Migration safe-add pour la table cards (si elle existait déjà avec l'ancien schéma)
alter table cards add column if not exists mechanic text not null default 'stamp';
alter table cards add column if not exists stamps_required int default 10;
alter table cards add column if not exists reward_label text default 'Un produit offert';
alter table cards add column if not exists points_per_euro int default 1;
alter table cards add column if not exists points_for_reward int default 100;
alter table cards add column if not exists primary_color text default '#7a1232';
alter table cards add column if not exists is_active boolean default true;
alter table cards add column if not exists stamp_shape text default 'circle';
alter table cards add column if not exists expiration_months int;
alter table cards add column if not exists style text default 'minimal';
alter table cards add column if not exists slogan text;
alter table cards add column if not exists background_url text;
alter table cards add column if not exists logo_url text;

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text,
  discount_label text,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists offers_business_idx on offers(business_id);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  message text not null,
  audience text not null default 'all',
  status text not null default 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  sent_count int default 0,
  created_at timestamptz default now()
);
create index if not exists campaigns_business_idx on campaigns(business_id, created_at desc);

create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  trigger text not null,
  message text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists automations_business_idx on automations(business_id);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now()
);
create index if not exists push_subs_customer_idx on push_subscriptions(customer_id);

alter table offers enable row level security;
alter table campaigns enable row level security;
alter table automations enable row level security;
alter table push_subscriptions enable row level security;

drop policy if exists "owner_offers" on offers;
create policy "owner_offers" on offers for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "owner_campaigns" on campaigns;
create policy "owner_campaigns" on campaigns for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "owner_automations" on automations;
create policy "owner_automations" on automations for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "owner_push" on push_subscriptions;
create policy "owner_push" on push_subscriptions for all
  using (customer_id in (select c.id from customers c join businesses b on b.id = c.business_id where b.owner_id = auth.uid()))
  with check (customer_id in (select c.id from customers c join businesses b on b.id = c.business_id where b.owner_id = auth.uid()));

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

drop policy if exists "owner_businesses" on businesses;
create policy "owner_businesses" on businesses for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "owner_cards" on cards;
create policy "owner_cards" on cards for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "owner_customers" on customers;
create policy "owner_customers" on customers for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "owner_customer_cards" on customer_cards;
create policy "owner_customer_cards" on customer_cards for all
  using (card_id in (select c.id from cards c join businesses b on b.id = c.business_id where b.owner_id = auth.uid()))
  with check (card_id in (select c.id from cards c join businesses b on b.id = c.business_id where b.owner_id = auth.uid()));

drop policy if exists "owner_activity" on activity;
create policy "owner_activity" on activity for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));
