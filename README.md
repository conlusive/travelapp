# SeasonWise

Сезонний планувальник подорожей українською: коли їхати, скільки це коштує, як дістатися, візи для українців.
Зараз працює календар сезонів за погодою для 25 напрямків; решта блоків чекає на перевірені дані.

## Запуск

```bash
npm ci
npm run dev        # http://localhost:3000
```

Сторінки працюють без жодних ключів. Для форми підписки:

```bash
cp .env.example .env.local   # заповнити SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY
```

## Карта коду

| Шлях | Призначення |
|---|---|
| `src/domain/` | Бізнес-правила: типи, вердикт сезону, агрегація клімату, місяці |
| `src/data/` | Каталог напрямків, кліматичні дані; `catalog.ts` — єдина точка читання |
| `src/app/` | Сторінки: `/`, `/{country}`, `/{country}/{destination}`, `/api/subscribe` |
| `src/components/` | Календар сезонів, пошук, форма підписки |
| `src/lib/` | Валідація email, rate limit, пошук, серверний клієнт Supabase |
| `scripts/import-climate.mts` | Імпорт клімату з NASA POWER у `src/data/climate.json` |
| `supabase/migrations/` | Схема БД (поки сторінки читають дані з файлів, не з БД) |
| `docs/` | Результати фаз плану; точність клімату: `docs/phase-1/climate-accuracy.md` |

## Додати напрямок

1. Додати запис у `src/data/destinations.ts` (і країну, якщо її ще немає).
2. `npm run import:climate`
3. `npm test`

## База даних

Застосовуйте міграції спершу до тестового проєкту Supabase (назва містить `test`), потім до робочого.
Тести перевіряють їх на тимчасовій базі в памʼяті (PGlite).

## Перевірки

```bash
npm run typecheck && npm run lint && npm test && npm run build
```
