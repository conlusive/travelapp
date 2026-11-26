-- Контентні таблиці (крок 1.3 плану). Читає їх лише сервер через service role.
-- Оцінку погоди та вердикт не зберігаємо: їх рахує src/domain/season.ts.
-- Ціни — діапазони в EUR (крок 4.3). Кожен ручний факт має дату перевірки.

create table public.countries (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name         text not null,
  currency     text not null check (currency ~ '^[A-Z]{3}$'),
  language     text not null,
  visa_info    text,
  safety_note  text,
  verified_at  date,
  constraint countries_facts_verified
    check ((visa_info is null and safety_note is null) or verified_at is not null)
);

create table public.destinations (
  id              uuid primary key default gen_random_uuid(),
  country_id      uuid not null references public.countries (id) on delete restrict,
  slug            text not null check (slug ~ '^[a-z0-9-]+$'),
  name            text not null,
  type            text not null check (type in ('city', 'resort', 'nature')),
  lat             double precision not null check (lat between -90 and 90),
  lng             double precision not null check (lng between -180 and 180),
  climate_caveat  boolean not null default false,
  unique (country_id, slug)
);

create table public.climate_monthly (
  destination_id    uuid not null references public.destinations (id) on delete cascade,
  month             smallint not null check (month between 1 and 12),
  avg_max_c         numeric(4, 1) not null,
  avg_min_c         numeric(4, 1) not null,
  precipitation_mm  integer not null check (precipitation_mm >= 0),
  rain_days         numeric(3, 1) not null check (rain_days between 0 and 31),
  source            text not null,
  first_year        smallint not null,
  last_year         smallint not null,
  fetched_at        date not null,
  primary key (destination_id, month),
  check (avg_max_c >= avg_min_c),
  check (last_year >= first_year)
);

-- Натовпи й ціни по місяцях: 100 = найкраще для мандрівника.
create table public.season_inputs (
  destination_id  uuid not null references public.destinations (id) on delete cascade,
  month           smallint not null check (month between 1 and 12),
  crowd_score     smallint check (crowd_score between 0 and 100),
  price_score     smallint check (price_score between 0 and 100),
  verified_at     date not null,
  primary key (destination_id, month),
  check (crowd_score is not null or price_score is not null)
);

create table public.attractions (
  id              uuid primary key default gen_random_uuid(),
  destination_id  uuid not null references public.destinations (id) on delete cascade,
  name            text not null,
  category        text not null,
  best_months     smallint[] not null default '{}'
                  check (best_months <@ array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]::smallint[]),
  visit_minutes   integer check (visit_minutes > 0),
  cost_min_eur    numeric(8, 2) check (cost_min_eur >= 0),
  cost_max_eur    numeric(8, 2),
  source_url      text not null check (source_url ~ '^https://'),
  verified_at     date not null,
  unique (destination_id, name),
  check ((cost_min_eur is null) = (cost_max_eur is null)),
  check (cost_max_eur >= cost_min_eur)
);

create table public.prices (
  destination_id        uuid not null references public.destinations (id) on delete cascade,
  month                 smallint not null check (month between 1 and 12),
  hotel_min_eur         numeric(8, 2) not null check (hotel_min_eur >= 0),
  hotel_max_eur         numeric(8, 2) not null,
  food_day_min_eur      numeric(8, 2) not null check (food_day_min_eur >= 0),
  food_day_max_eur      numeric(8, 2) not null,
  transport_day_min_eur numeric(8, 2) not null check (transport_day_min_eur >= 0),
  transport_day_max_eur numeric(8, 2) not null,
  source_url            text not null check (source_url ~ '^https://'),
  verified_at           date not null,
  primary key (destination_id, month),
  check (hotel_max_eur >= hotel_min_eur),
  check (food_day_max_eur >= food_day_min_eur),
  check (transport_day_max_eur >= transport_day_min_eur)
);

create table public.routes (
  id                uuid primary key default gen_random_uuid(),
  destination_id    uuid not null references public.destinations (id) on delete cascade,
  from_city         text not null,
  modes             text[] not null
                    check (cardinality(modes) > 0 and modes <@ array['plane', 'train', 'bus', 'ferry', 'car']),
  duration_minutes  integer not null check (duration_minutes > 0),
  price_min_eur     numeric(8, 2) not null check (price_min_eur >= 0),
  price_max_eur     numeric(8, 2) not null,
  source_url        text not null check (source_url ~ '^https://'),
  verified_at       date not null,
  unique (destination_id, from_city, modes),
  check (price_max_eur >= price_min_eur)
);

create table public.hotels (
  id              uuid primary key default gen_random_uuid(),
  destination_id  uuid not null references public.destinations (id) on delete cascade,
  name            text not null,
  area            text not null,
  price_level     smallint not null check (price_level between 1 and 3),
  affiliate_url   text not null check (affiliate_url ~ '^https://'),
  verified_at     date not null,
  unique (destination_id, name)
);

create table public.events (
  id              uuid primary key default gen_random_uuid(),
  destination_id  uuid not null references public.destinations (id) on delete cascade,
  name            text not null,
  month           smallint not null check (month between 1 and 12),
  description     text not null,
  source_url      text not null check (source_url ~ '^https://'),
  verified_at     date not null,
  unique (destination_id, month, name)
);

-- RLS без політик + забрані права: клієнтські ролі не мають доступу.
alter table public.countries       enable row level security;
alter table public.destinations    enable row level security;
alter table public.climate_monthly enable row level security;
alter table public.season_inputs   enable row level security;
alter table public.attractions     enable row level security;
alter table public.prices          enable row level security;
alter table public.routes          enable row level security;
alter table public.hotels          enable row level security;
alter table public.events          enable row level security;

revoke all on
  public.countries,
  public.destinations,
  public.climate_monthly,
  public.season_inputs,
  public.attractions,
  public.prices,
  public.routes,
  public.hotels,
  public.events
from anon, authenticated;

-- Відкат (ВИДАЛЯЄ весь контент, виконувати лише свідомо, після експорту):
--   drop table public.events, public.hotels, public.routes, public.prices, public.attractions,
--     public.season_inputs, public.climate_monthly, public.destinations, public.countries;
