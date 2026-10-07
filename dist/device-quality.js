// Use the lighter profile on phones. Desktop windows and touch laptops keep
// their original profile even when resized or reporting fewer CPU cores.
export function useLowPowerGraphics() {
  return matchMedia('(hover: none) and (pointer: coarse)').matches &&
    Math.min(screen.width, screen.height) <= 700;
}

export function graphicsPixelRatio(width, height, lowPower, ratio = devicePixelRatio || 1) {
  if (!lowPower) return Math.min(ratio, 1.5, 2200 / Math.max(1, width));
  return Math.min(ratio, 1, Math.sqrt(900000 / Math.max(1, width * height)));
}

