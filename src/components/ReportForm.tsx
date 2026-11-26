"use client";

import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import { REPORT_MAX_LENGTH, REPORT_MIN_LENGTH } from "@/lib/report";

type Status = "idle" | "loading" | "success" | "error";

const ERROR_MESSAGES: Record<number, string> = {
  400: `Опишіть неточність хоча б ${REPORT_MIN_LENGTH} символами.`,
  429: "Забагато повідомлень. Зачекайте хвилину.",
};
const DEFAULT_ERROR = "Не вдалося надіслати. Спробуйте трохи пізніше.";

export function ReportForm() {
  const path = usePathname();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const form = new FormData(event.currentTarget);
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, message: form.get("message"), website: form.get("website") }),
      });
      if (response.ok) {
        setStatus("success");
        return;
      }
      setStatus("error");
      setError(ERROR_MESSAGES[response.status] ?? DEFAULT_ERROR);
    } catch {
      setStatus("error");
      setError(DEFAULT_ERROR);
    }
  }

  return (
    <details className="rounded-2xl border border-border bg-surface p-4">
      <summary className="cursor-pointer text-sm font-semibold">Повідомити про неточність</summary>
      {status === "success" ? (
        <p role="status" className="mt-3 text-sm">
          Дякуємо! Перевіримо.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-3 flex flex-col items-start gap-3">
          <label htmlFor="report-message" className="text-sm text-muted">
            Що саме неправильно? Не пишіть особистих даних.
          </label>
          <textarea
            id="report-message"
            name="message"
            rows={3}
            required
            minLength={REPORT_MIN_LENGTH}
            maxLength={REPORT_MAX_LENGTH}
            className="w-full rounded-xl border border-border bg-background p-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-11 cursor-pointer rounded-xl bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-accent-strong disabled:opacity-60"
          >
            {status === "loading" ? "Надсилаємо…" : "Надіслати"}
          </button>
          <p role="alert" className="min-h-5 text-sm text-danger">
            {status === "error" ? error : ""}
          </p>
        </form>
      )}
    </details>
  );
}
