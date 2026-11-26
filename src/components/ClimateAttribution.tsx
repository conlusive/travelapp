import { climateSource } from "@/data/catalog";

export function ClimateAttribution() {
  const { name, url, version, accessedAt, firstYear, lastYear } = climateSource;

  return (
    <p className="text-xs text-muted">
      Клімат: середні за {firstYear}–{lastYear} роки. Дані отримано з проєкту{" "}
      <a href={url} className="underline">
        NASA Langley Research Center POWER
      </a>{" "}
      ({name} {version}), фінансованого NASA Earth Science Division; помісячні середні обчислено
      нами. Оновлено: {accessedAt}.
    </p>
  );
}
