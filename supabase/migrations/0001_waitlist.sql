-- Список очікування з лендінгу (крок 0.4 плану).
-- Запис іде лише з сервера через service role; клієнтським ролям доступу немає.

create table if not exists public.waitlist_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text,
  created_at  timestamptz not null default now(),
  constraint waitlist_email_canonical check (email = lower(btrim(email))),
  constraint waitlist_email_length    check (char_length(email) between 3 and 254),
  constraint waitlist_source_format   check (source is null or source ~ '^[a-z0-9_-]{1,40}$'),
  constraint waitlist_email_unique    unique (email)
);

alter table public.waitlist_subscribers enable row level security;

-- Без політик RLS клієнтські ролі нічого не бачать; додатково забираємо права.
revoke all on public.waitlist_subscribers from anon, authenticated;

-- Відкат (ВИДАЛЯЄ всі зібрані email-и, виконувати лише свідомо, після експорту):
--   drop table public.waitlist_subscribers;
