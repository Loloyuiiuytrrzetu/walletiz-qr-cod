-- Walletiz schema
-- Multi-tenant: chaque user owner = un "business" (commerce)

create extension if not exists "pgcrypto";

-- Businesses (commerçants)
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  logo_url text,
  plan text not null default 'gratuit', -- gratuit | solo | pro
  created_at timestamptz default now()
);

create index if not exists businesses_owner_idx on businesses(owner_id);

-- Loyalty cards (programme de fidélité d'un business)
create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null default 'Carte principale',
  mechanic text not null default 'stamp', -- stamp | points
  stamps_required int default 8,
  reward_label text default '10% de réduction',
  stamp_shape text default 'circle', -- circle | square | rounded | hexagon
  expiration_months int, -- null = jamais
  style text default 'minimal', -- minimal | aura
  primary_color text default '#7B1E2B',
  slogan text,
  background_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists cards_business_idx on cards(business_id);

-- Customers (clients fidèles d'un business)
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

-- Customer cards (relation client <-> carte avec progression)
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

-- Activity (chaque scan / tampon / récompense)
create table if not exists activity (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  card_id uuid references cards(id) on delete cascade,
  kind text not null, -- stamp | reward | scan | points
  amount int default 1,
  note text,
  created_at timestamptz default now()
);

create index if not exists activity_business_idx on activity(business_id, created_at desc);

-- Offers (mes offres)
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text,
  discount_label text, -- ex "-20%", "Café offert x10"
  starts_at timestamptz default now(),
  ends_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Campaigns (notifications push programmables)
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  message text not null,
  icon_url text,
  link_url text,
  audience text not null default 'all', -- all | active | inactive
  status text not null default 'draft', -- draft | scheduled | sending | sent | failed
  scheduled_at timestamptz,
  sent_at timestamptz,
  sent_count int default 0,
  failed_count int default 0,
  created_at timestamptz default now()
);

create index if not exists campaigns_scheduled_idx on campaigns(status, scheduled_at);

-- Automations (déclencheurs automatiques)
create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  trigger text not null, -- signup | inactivity_30 | birthday | reward_ready
  message text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Push subscriptions (Web Push - clients)
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

-- RLS
alter table businesses enable row level security;
alter table cards enable row level security;
alter table customers enable row level security;
alter table customer_cards enable row level security;
alter table activity enable row level security;
alter table offers enable row level security;
alter table campaigns enable row level security;
alter table automations enable row level security;
alter table push_subscriptions enable row level security;

-- Policies: owner_id = auth.uid()
create policy "owner_businesses" on businesses
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner_cards" on cards for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "owner_customers" on customers for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "owner_customer_cards" on customer_cards for all
  using (card_id in (select c.id from cards c join businesses b on b.id = c.business_id where b.owner_id = auth.uid()));

create policy "owner_activity" on activity for all
  using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "owner_offers" on offers for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "owner_campaigns" on campaigns for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "owner_automations" on automations for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "owner_push" on push_subscriptions for all
  using (customer_id in (select c.id from customers c join businesses b on b.id = c.business_id where b.owner_id = auth.uid()));
