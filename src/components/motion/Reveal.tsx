"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Показує вміст із анімацією, коли він доїжджає до екрана. Приховує лише те, що ще нижче
 * екрана: без JavaScript і для видимого одразу вмісту нічого не блимає.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    element.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Другий варіант — блок уже проскочили (перехід за якорем): показуємо без чекання.
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      delete element.dataset.reveal;
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
