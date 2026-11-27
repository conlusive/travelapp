"use client";

import { useSyncExternalStore } from "react";
import { parseSaved, toggleSlug } from "@/lib/saved";

const STORAGE_KEY = "seasonwise:saved";
const CHANGE_EVENT = "seasonwise:saved-change";

// Якщо сховище заблоковане (приватний режим), список живе до перезавантаження сторінки.
let fallback = "";

function read(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(list: string[]) {
  fallback = JSON.stringify(list);
  try {
    window.localStorage.setItem(STORAGE_KEY, fallback);
  } catch {
    // Сховище заблоковане: лишається значення в памʼяті.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Збережені напрямки цього браузера; на сервері список порожній. */
export function useSaved() {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  const saved = parseSaved(raw);
  return {
    saved,
    toggle: (slug: string) => write(toggleSlug(parseSaved(read()), slug)),
  };
}
