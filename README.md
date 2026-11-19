# SeasonWise

Сезонний планувальник подорожей українською: коли їхати, скільки це коштує, як дістатися, візи для українців.
План розробки: `docs/` (фази 0.x) і `travel-app-plan.md`.

## Запуск

```bash
npm ci
cp .env.example .env.local   # заповнити SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

## База даних

Міграції лежать у `supabase/migrations/`. Поки що одна таблиця `waitlist_subscribers` (список очікування з лендінгу).
Застосовуйте їх спершу до тестового проєкту Supabase, потім до робочого.

## Перевірки

```bash
npx tsc --noEmit && npm run lint && npx vitest run && npm run build
```
