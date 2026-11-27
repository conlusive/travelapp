"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  /** exit — блок виїжджає вгору (0→1); enter — блок заїжджає знизу (0→1). */
  mode: "exit" | "enter";
  className?: string;
  children: ReactNode;
};

/** Записує прогрес прокручування у CSS-змінну --progress без перерендерів React. */
export function ScrollProgress({ mode, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Без анімацій лишаються значення за замовчуванням із CSS.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const value =
        mode === "exit"
          ? -rect.top / rect.height
          : (window.innerHeight - rect.top) / (window.innerHeight * 0.85);
      element.style.setProperty("--progress", Math.min(1, Math.max(0, value)).toFixed(4));
    };
    const schedule = () => {
      frame ||= window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, [mode]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
