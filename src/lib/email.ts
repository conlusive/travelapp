// RFC 5321: адреса не довша за 254 символи.
const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOURCE_PATTERN = /^[a-z0-9_-]{1,40}$/;

/** Приводить email до канонічного вигляду; повертає null, якщо він некоректний. */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length === 0 || email.length > MAX_EMAIL_LENGTH) return null;
  if (!EMAIL_PATTERN.test(email)) return null;
  return email;
}

/** Мітка каналу (utm/src) для аналізу, з яких спільнот приходять підписники. */
export function normalizeSource(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const source = value.trim().toLowerCase();
  return SOURCE_PATTERN.test(source) ? source : null;
}
