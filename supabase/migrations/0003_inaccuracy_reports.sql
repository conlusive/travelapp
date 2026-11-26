-- Повідомлення «неточність на сторінці» (крок 4.3 плану).
-- Межі збігаються з src/lib/report.ts. Контактів користувача не зберігаємо.

create table public.inaccuracy_reports (
  id          uuid primary key default gen_random_uuid(),
  path        text not null check (path ~ '^/[a-z0-9/-]{0,199}$'),
  message     text not null check (char_length(message) between 10 and 1000),
  created_at  timestamptz not null default now()
);

alter table public.inaccuracy_reports enable row level security;
revoke all on public.inaccuracy_reports from anon, authenticated;

-- Відкат (ВИДАЛЯЄ всі повідомлення, виконувати лише свідомо):
--   drop table public.inaccuracy_reports;
