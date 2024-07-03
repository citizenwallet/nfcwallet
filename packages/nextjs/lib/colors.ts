function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export function darkenHexColor(hex: string, percent: number): string {
  let [r, g, b] = hexToRgb(hex);
  r = Math.max(0, Math.min(255, r - (r * percent) / 100));
  g = Math.max(0, Math.min(255, g - (g * percent) / 100));
  b = Math.max(0, Math.min(255, b - (b * percent) / 100));
  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
}

function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export function hexToRgba(hex: string, alpha?: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha || 1})`;
}
