// Застосовує всі міграції до тимчасової бази в памʼяті (PGlite) і перевіряє права та обмеження.
import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COUNTRIES, DESTINATIONS } from "../src/data/destinations";
import climate from "../src/data/climate.json" with { type: "json" };

const MIGRATIONS_DIR = new URL("./migrations/", import.meta.url);

// Відтворює ролі й права за замовчуванням, які має новий проєкт Supabase.
const SUPABASE_BASELINE = `
  create role anon;
  create role authenticated;
  create role service_role bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
`;

let db: PGlite;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_BASELINE);
  const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    await db.exec(await readFile(new URL(file, MIGRATIONS_DIR), "utf8"));
  }
}, 60_000);

afterAll(async () => {
  await db.close();
});

async function publicTables(): Promise<{ name: string; rls: boolean }[]> {
  const result = await db.query<{ name: string; rls: boolean }>(`
    select relname as name, relrowsecurity as rls
    from pg_class
    where relnamespace = 'public'::regnamespace and relkind = 'r'
    order by relname
  `);
  return result.rows;
}

describe("access control", () => {
  it("enables RLS on every public table", async () => {
    const tables = await publicTables();
    expect(tables).toHaveLength(10);
    expect(tables.filter((table) => !table.rls)).toEqual([]);
  });

  it.each(["anon", "authenticated"])("gives %s no privileges on any table", async (role) => {
    for (const { name } of await publicTables()) {
      const result = await db.query<{ allowed: boolean }>(
        `select has_table_privilege($1, $2, 'select, insert, update, delete, truncate') as allowed`,
        [role, `public.${name}`],
      );
      expect(result.rows[0].allowed, name).toBe(false);
    }
  });

  it("lets the server role write to the waitlist and blocks anon", async () => {
    await db.exec("set role service_role");
    await db.query("insert into waitlist_subscribers (email) values ('server@example.com')");
    await db.exec("reset role; set role anon");
    await expect(db.query("select * from waitlist_subscribers")).rejects.toThrow(/permission denied/);
    await db.exec("reset role");
  });
});

describe("waitlist constraints", () => {
  it("ignores a duplicate email instead of creating a second row", async () => {
    const upsert = `insert into waitlist_subscribers (email) values ('dup@example.com')
                    on conflict (email) do nothing`;
    await db.query(upsert);
    await db.query(upsert);
    const result = await db.query<{ count: number }>(
      "select count(*)::int as count from waitlist_subscribers where email = 'dup@example.com'",
    );
    expect(result.rows[0].count).toBe(1);
  });

  it.each([
    ["uppercase email", "insert into waitlist_subscribers (email) values ('A@example.com')"],
    [
      "unsafe source",
      "insert into waitlist_subscribers (email, source) values ('b@example.com', '<x>')",
    ],
  ])("rejects %s", async (_label, sql) => {
    await expect(db.query(sql)).rejects.toThrow(/violates check constraint/);
  });
});

describe("content schema", () => {
  it("accepts the whole current catalog with its climate data", async () => {
    for (const country of COUNTRIES) {
      await db.query(
        "insert into countries (slug, name, currency, language) values ($1, $2, $3, $4)",
        [country.slug, country.name, country.currency, country.language],
      );
    }
    const months: Record<string, (typeof climate.destinations)["lisbon"]> = climate.destinations;
    for (const d of DESTINATIONS) {
      await db.query(
        `insert into destinations (country_id, slug, name, type, lat, lng, climate_caveat)
         select id, $2, $3, $4, $5, $6, $7 from countries where slug = $1`,
        [d.countrySlug, d.slug, d.name, d.type, d.lat, d.lng, d.climateCaveat ?? false],
      );
      for (const m of months[d.slug]) {
        await db.query(
          `insert into climate_monthly
           select id, $2, $3, $4, $5, $6, $7, $8, $9, $10 from destinations where slug = $1`,
          [
            d.slug,
            m.month,
            m.avgMaxC,
            m.avgMinC,
            m.precipitationMm,
            m.rainDays,
            climate.source.name,
            climate.source.firstYear,
            climate.source.lastYear,
            climate.source.accessedAt,
          ],
        );
      }
    }
    const result = await db.query<{ count: number }>(
      "select count(*)::int as count from climate_monthly",
    );
    expect(result.rows[0].count).toBe(DESTINATIONS.length * 12);
  }, 60_000);

  const lisbon = "(select id from destinations where slug = 'lisbon')";

  it.each([
    [
      "a month outside 1–12",
      `insert into season_inputs values (${lisbon}, 13, 50, 50, current_date)`,
    ],
    [
      "season inputs without any score",
      `insert into season_inputs values (${lisbon}, 1, null, null, current_date)`,
    ],
    [
      "a reversed price range",
      `insert into prices values (${lisbon}, 1, 100, 50, 10, 20, 1, 2, 'https://e.com', current_date)`,
    ],
    [
      "an attraction cost with only one bound",
      `insert into attractions (destination_id, name, category, cost_min_eur, source_url, verified_at)
       values (${lisbon}, 'x', 'museum', 5, 'https://e.com', current_date)`,
    ],
    [
      "an unknown transport mode",
      `insert into routes (destination_id, from_city, modes, duration_minutes, price_min_eur,
         price_max_eur, source_url, verified_at)
       values (${lisbon}, 'Київ', array['rocket'], 60, 1, 2, 'https://e.com', current_date)`,
    ],
    [
      "a non-https affiliate link",
      `insert into hotels (destination_id, name, area, price_level, affiliate_url, verified_at)
       values (${lisbon}, 'x', 'y', 1, 'javascript:alert(1)', current_date)`,
    ],
    [
      "visa information without a verification date",
      "update countries set visa_info = 'text' where slug = 'portugal'",
    ],
  ])("rejects %s", async (_label, sql) => {
    await expect(db.query(sql)).rejects.toThrow(/violates check constraint/);
  });
});
