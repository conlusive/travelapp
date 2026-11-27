"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { MAP_HEIGHT, MAP_WIDTH } from "@/lib/map-size";
import {
  easeInOut,
  fitBounds,
  interpolateView,
  panBy,
  zoomAt,
  type Bounds,
  type View,
} from "@/lib/map-view";

const WORLD = { width: MAP_WIDTH, height: MAP_HEIGHT };
const ANIMATION_MS = 900;
const DRAG_THRESHOLD_PX = 5;

type Size = { width: number; height: number };

function worldView(aspect: number): Bounds {
  // На вузькому екрані весь світ нечитабельний: починаємо з Європи й сусідів, решту — перетягуванням.
  return aspect < 1.2 ? [870, 60, 1510, 700] : [60, 40, 1940, 930];
}

/** Вікно карти: плавно летить до меж вибору, перетягується та масштабується. */
export function useMapView(container: RefObject<HTMLDivElement | null>, target: Bounds | null) {
  const [size, setSize] = useState<Size | null>(null);
  const [view, setView] = useState<View | null>(null);
  const viewRef = useRef<View | null>(null);
  const frame = useRef(0);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const apply = useCallback((next: View) => {
    viewRef.current = next;
    setView(next);
  }, []);

  const flyTo = useCallback(
    (to: View) => {
      window.cancelAnimationFrame(frame.current);
      const from = viewRef.current;
      const instant = !from || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = performance.now();
      const step = (now: number) => {
        const t = instant ? 1 : Math.min(1, Math.max(0, (now - start) / ANIMATION_MS));
        apply(t === 1 ? to : interpolateView(from!, to, easeInOut(t)));
        if (t < 1) frame.current = window.requestAnimationFrame(step);
      };
      frame.current = window.requestAnimationFrame(step);
    },
    [apply],
  );

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [container]);

  // Порівнюємо координати цілі, а не обʼєкт: політ починається лише коли ціль справді змінилась.
  const targetKey = target?.join(",") ?? "";

  const reset = useCallback(() => {
    if (!size) return;
    const aspect = size.width / size.height;
    const bounds = targetKey ? (targetKey.split(",").map(Number) as Bounds) : null;
    flyTo(fitBounds(bounds ?? worldView(aspect), aspect, WORLD, bounds ? 0.08 : 0));
  }, [size, targetKey, flyTo]);

  useEffect(() => {
    reset();
    return () => window.cancelAnimationFrame(frame.current);
  }, [reset]);

  const zoom = useCallback(
    (factor: number) => {
      if (viewRef.current) flyTo(zoomAt(viewRef.current, factor, WORLD));
    },
    [flyTo],
  );

  // Щипок на тачпаді приходить як wheel із ctrlKey; звичайне прокручування сторінки не чіпаємо.
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      const current = viewRef.current;
      if (!current) return;
      event.preventDefault();
      window.cancelAnimationFrame(frame.current);
      const rect = element.getBoundingClientRect();
      const anchor = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
      apply(zoomAt(current, Math.exp(event.deltaY * 0.01), WORLD, anchor));
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [container, apply]);

  const handlers = {
    onPointerDown(event: PointerEvent) {
      suppressClick.current = false;
      if (event.button !== 0) return;
      drag.current = { x: event.clientX, y: event.clientY, moved: false };
    },
    onPointerMove(event: PointerEvent) {
      const state = drag.current;
      const current = viewRef.current;
      if (!state || !current || !size) return;
      if (event.buttons === 0) {
        drag.current = null;
        return;
      }
      const dx = event.clientX - state.x;
      const dy = event.clientY - state.y;
      if (!state.moved) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        state.moved = true;
        window.cancelAnimationFrame(frame.current);
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      apply(panBy(current, dx / size.width, dy / size.height, WORLD));
      state.x = event.clientX;
      state.y = event.clientY;
    },
    onPointerUp() {
      suppressClick.current = drag.current?.moved ?? false;
      drag.current = null;
    },
    onPointerCancel() {
      drag.current = null;
    },
    // Відпускання після перетягування не має вибирати країну під курсором.
    onClickCapture(event: { stopPropagation: () => void; preventDefault: () => void }) {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      event.stopPropagation();
      event.preventDefault();
    },
  };

  return { view, size, handlers, zoom, reset };
}
