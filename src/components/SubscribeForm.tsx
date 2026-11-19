"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "Схоже, в адресі помилка. Перевірте її й спробуйте ще раз.",
  rate_limited: "Забагато спроб. Зачекайте хвилину й повторіть.",
};
const DEFAULT_ERROR = "Не вдалося зберегти адресу. Спробуйте ще раз трохи пізніше.";

function readSource(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("src") ?? params.get("utm_source");
}

export function SubscribeForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const form = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          website: form.get("website"),
          source: readSource(),
        }),
      });

      if (response.ok) {
        setStatus("success");
        return;
      }
      const data: unknown = await response.json().catch(() => null);
      const code =
        typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
          ? data.error
          : "";
      setStatus("error");
      setMessage(ERROR_MESSAGES[code] ?? DEFAULT_ERROR);
    } catch {
      setStatus("error");
      setMessage(DEFAULT_ERROR);
    }
  }

  if (status === "success") {
    return (
      <p
        role="status"
        className="rounded-xl border border-accent/30 bg-accent/10 px-5 py-4 text-base font-medium"
      >
        Дякуємо! Ми напишемо, щойно відкриємо доступ.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="email" className="sr-only">
          Ваш email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@example.com"
          aria-describedby="form-hint form-message"
          className="min-h-12 flex-1 rounded-xl border border-border bg-surface px-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        {/* Honeypot: прихований від людей і скрінрідерів, боти його заповнюють. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Не заповнюйте це поле</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-12 rounded-xl bg-accent px-6 text-base font-semibold text-white transition hover:bg-accent-strong disabled:opacity-60"
        >
          {status === "loading" ? "Надсилаємо…" : "Хочу ранній доступ"}
        </button>
      </div>
      <p id="form-hint" className="mt-3 text-sm text-muted">
        Лише лист про запуск і кілька оновлень. Без спаму, відписатися можна будь-коли.
      </p>
      <p id="form-message" role="alert" className="mt-2 min-h-5 text-sm text-danger">
        {status === "error" ? message : ""}
      </p>
    </form>
  );
}
