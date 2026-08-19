/** Focal point helpers — percentages for CSS object-position */

export type ImageFocalPoint = {
  x: number
  y: number
}

export const DEFAULT_FOCAL_POINT: ImageFocalPoint = { x: 50, y: 50 }

export function clampFocal(value: unknown, fallback = 50): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(100, Math.max(0, Math.round(n * 10) / 10))
}

export function normalizeFocalPoint(
  x?: unknown,
  y?: unknown,
  fallback: ImageFocalPoint = DEFAULT_FOCAL_POINT
): ImageFocalPoint {
  return {
    x: clampFocal(x, fallback.x),
    y: clampFocal(y, fallback.y),
  }
}

/** CSS object-position value, e.g. "45% 20%" */
export function focalToObjectPosition(x?: unknown, y?: unknown): string {
  const { x: fx, y: fy } = normalizeFocalPoint(x, y)
  return `${fx}% ${fy}%`
}
