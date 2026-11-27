// Завантажує фото напрямків із Wikimedia Commons (src/data/photo-sources.json),
// стискає їх у public/photos і записує автора та ліцензію в src/data/photos.json.
// Запуск: npm run fetch:photos
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const API = "https://commons.wikimedia.org/w/api.php";
const HEADERS = { "User-Agent": "SeasonWise-dev/0.1 (photo import script)" };
// Wikimedia віддає мініатюри лише стандартних ширин.
const SOURCE_WIDTH = 1920;
const PAUSE_MS = 1500;
const MAX_ATTEMPTS = 5;
// Вільні ліцензії, що дозволяють комерційне використання із зазначенням автора.
const ALLOWED_LICENSE = /^(CC0|Public domain|CC BY(-SA)? [0-9.]+( [a-z-]+)?)$/i;

const SOURCES = new URL("../src/data/photo-sources.json", import.meta.url);
const OUTPUT = new URL("../src/data/photos.json", import.meta.url);
const PHOTO_DIR = new URL("../public/photos/", import.meta.url);

type ImageInfo = {
  thumburl: string;
  descriptionurl: string;
  extmetadata: Record<string, { value: string } | undefined>;
};

type ApiResponse = {
  query: {
    normalized?: { from: string; to: string }[];
    pages: Record<string, { title: string; imageinfo?: ImageInfo[] }>;
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function politeFetch(url: string | URL): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await sleep(PAUSE_MS);
    const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(60_000) });
    if (response.ok) return response;
    if (response.status !== 429) throw new Error(`${response.status} for ${url}`);
    await sleep((Number(response.headers.get("retry-after")) || 30 * attempt) * 1000);
  }
  throw new Error(`Rate limited: ${url}`);
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const sources: Record<string, string> = JSON.parse(await readFile(SOURCES, "utf8"));
const url = new URL(API);
url.search = new URLSearchParams({
  action: "query",
  format: "json",
  titles: Object.values(sources).join("|"),
  prop: "imageinfo",
  iiprop: "url|extmetadata",
  iiurlwidth: String(SOURCE_WIDTH),
}).toString();

const data = (await (await politeFetch(url)).json()) as ApiResponse;
const pages = Object.values(data.query.pages);
const normalized = new Map(data.query.normalized?.map(({ from, to }) => [from, to]));

await mkdir(PHOTO_DIR, { recursive: true });
// Уже завантажені фото з тим самим джерелом не качаємо повторно.
const existing: Record<string, { title: string }> = JSON.parse(
  await readFile(OUTPUT, "utf8").catch(() => "{}"),
);
const photos: Record<string, object> = {};

for (const [slug, title] of Object.entries(sources)) {
  const info = pages.find((page) => page.title === (normalized.get(title) ?? title))?.imageinfo?.[0];
  if (!info) throw new Error(`No image info for ${slug}: ${title}`);

  const file = new URL(`${slug}.jpg`, PHOTO_DIR);
  if (existing[slug]?.title === title && (await access(file).then(() => true, () => false))) {
    photos[slug] = existing[slug];
    continue;
  }

  const meta = info.extmetadata;
  const license = meta.LicenseShortName?.value ?? "";
  const author = plainText(meta.Artist?.value ?? "");
  if (!ALLOWED_LICENSE.test(license)) throw new Error(`License "${license}" not allowed: ${slug}`);
  if (!author) throw new Error(`No author for ${slug}`);

  const original = Buffer.from(await (await politeFetch(info.thumburl)).arrayBuffer());
  const { data: jpeg, info: size } = await sharp(original)
    .resize({ width: SOURCE_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 74, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  const blur = await sharp(original).resize({ width: 16 }).jpeg({ quality: 50 }).toBuffer();
  await writeFile(file, jpeg);

  photos[slug] = {
    title,
    src: `/photos/${slug}.jpg`,
    width: size.width,
    height: size.height,
    blur: `data:image/jpeg;base64,${blur.toString("base64")}`,
    author,
    license,
    licenseUrl: meta.LicenseUrl?.value ?? null,
    sourceUrl: info.descriptionurl,
  };
  console.log(`ok ${slug} ${Math.round(jpeg.length / 1024)} KB · ${license} · ${author}`);
}

await writeFile(OUTPUT, `${JSON.stringify(photos, null, 1)}\n`);
console.log(`Saved ${Object.keys(photos).length} photos`);
