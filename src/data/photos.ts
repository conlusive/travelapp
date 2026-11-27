// Фото напрямків із Wikimedia Commons; файл photos.json пише scripts/fetch-photos.mts.
import data from "./photos.json" with { type: "json" };

export type Photo = {
  src: string;
  width: number;
  height: number;
  /** Крихітна копія для плавної появи. */
  blur: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
};

const photos: Record<string, Photo> = data;

export function getPhoto(destinationSlug: string): Photo {
  const photo = photos[destinationSlug];
  if (!photo) throw new Error(`No photo for destination "${destinationSlug}"`);
  return photo;
}
