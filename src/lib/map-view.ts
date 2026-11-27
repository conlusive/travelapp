// Чиста математика вікна карти: зум, зсув, анімація, розстановка підписів.

/** [x0, y0, x1, y1] в одиницях карти. */
export type Bounds = [number, number, number, number];

/** Видима частина карти (SVG viewBox). */
export type View = { x: number; y: number; width: number; height: number };

export type World = { width: number; height: number };

export const MIN_VIEW_WIDTH = 60;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Не дає вікну стати замалим, завеликим чи виїхати за межі світу. */
export function clampView(view: View, world: World): View {
  const aspect = view.width / view.height;
  // Найширше вікно — те, в якому ще видно весь світ із заданими пропорціями.
  const maxWidth = Math.max(world.width, world.height * aspect);
  const width = clamp(view.width, MIN_VIEW_WIDTH, maxWidth);
  const height = width / aspect;
  const center = { x: view.x + view.width / 2, y: view.y + view.height / 2 };
  const axis = (middle: number, size: number, total: number) =>
    size >= total ? (total - size) / 2 : clamp(middle - size / 2, 0, total - size);

  return {
    x: axis(center.x, width, world.width),
    y: axis(center.y, height, world.height),
    width,
    height,
  };
}

/** Вікно з пропорціями контейнера, яке вміщує межі з відступом (частка від розміру). */
export function fitBounds(bounds: Bounds, aspect: number, world: World, padding = 0.08): View {
  const [x0, y0, x1, y1] = bounds;
  const boxWidth = (x1 - x0) * (1 + padding * 2);
  const boxHeight = (y1 - y0) * (1 + padding * 2);
  const width = Math.max(boxWidth, boxHeight * aspect, MIN_VIEW_WIDTH);
  const height = width / aspect;

  return clampView(
    { x: (x0 + x1) / 2 - width / 2, y: (y0 + y1) / 2 - height / 2, width, height },
    world,
  );
}

/** factor < 1 наближає; точка під anchor (частки 0–1) лишається на місці. */
export function zoomAt(
  view: View,
  factor: number,
  world: World,
  anchor: { x: number; y: number } = { x: 0.5, y: 0.5 },
): View {
  const target = clampView({ ...view, width: view.width * factor, height: view.height * factor }, world);
  return clampView(
    {
      ...target,
      x: view.x + anchor.x * (view.width - target.width),
      y: view.y + anchor.y * (view.height - target.height),
    },
    world,
  );
}

/** dx, dy — зсув у частках видимого вікна (перетягування мишею). */
export function panBy(view: View, dx: number, dy: number, world: World): View {
  return clampView({ ...view, x: view.x - dx * view.width, y: view.y - dy * view.height }, world);
}

/** Межі, що охоплюють усі точки з полем навколо; null, якщо точок немає. */
export function boundsAround(points: { x: number; y: number }[], margin: number): Bounds | null {
  if (points.length === 0) return null;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return [
    Math.min(...xs) - margin,
    Math.min(...ys) - margin,
    Math.max(...xs) + margin,
    Math.max(...ys) + margin,
  ];
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Масштаб змінюється геометрично, щоб наближення не «прискорювалося» наприкінці. */
export function interpolateView(from: View, to: View, t: number): View {
  const mix = (a: number, b: number) => a + (b - a) * t;
  const width = from.width * (to.width / from.width) ** t;
  const height = from.height * (to.height / from.height) ** t;
  const x = mix(from.x + from.width / 2, to.x + to.width / 2) - width / 2;
  const y = mix(from.y + from.height / 2, to.y + to.height / 2) - height / 2;
  return { x, y, width, height };
}

/** Позиція точки карти у відсотках контейнера. */
export function toPercent(view: View, x: number, y: number) {
  return { left: ((x - view.x) / view.width) * 100, top: ((y - view.y) / view.height) * 100 };
}

export type LabelPoint = { id: string; left: number; top: number; text: string };

const LABEL_HEIGHT = 30;
const CHARACTER_WIDTH = 8;
const LABEL_PADDING = 30;

export type LabelSide = "right" | "left";

/**
 * Які підписи показати без накладань і з якого боку від точки (спершу праворуч).
 * Позиції в пікселях; порядок задає пріоритет.
 */
export function placeLabels(points: LabelPoint[]): Map<string, LabelSide> {
  const placed: Bounds[] = [];
  const result = new Map<string, LabelSide>();
  const dots: Bounds[] = points.map((p) => [p.left - 8, p.top - 8, p.left + 8, p.top + 8]);
  const overlaps = (a: Bounds, b: Bounds) =>
    a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

  points.forEach((point, index) => {
    const width = point.text.length * CHARACTER_WIDTH + LABEL_PADDING;
    for (const side of ["right", "left"] as const) {
      const start = side === "right" ? point.left + 10 : point.left - 10 - width;
      const label: Bounds = [
        start,
        point.top - LABEL_HEIGHT / 2,
        start + width,
        point.top + LABEL_HEIGHT / 2,
      ];
      const blocked =
        placed.some((other) => overlaps(label, other)) ||
        dots.some((dot, other) => other !== index && overlaps(label, dot));
      if (blocked) continue;
      placed.push(label);
      result.set(point.id, side);
      break;
    }
  });

  return result;
}
