import themes from "@/themes.json";
import { defaultsDeep } from "lodash";

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

function getLuminance(r: number, g: number, b: number): number {
  const [R, G, B] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// Returns the text color that should be used based on the luminosity of the background color
export function getTextColor(hex: string): "black" | "white" {
  const rgb = hexToRgb(hex);
  const luminance = getLuminance(...rgb);
  // Use a threshold of 0.5 for luminance
  return luminance > 0.5 ? "black" : "white";
}

type nfcSettings = {
  scannerLogo: string;
  deviceName: string;
};

export type Theme = {
  primary: string;
  secondary?: string;
  text?: string;
  greeting?: string;
  nfc?: nfcSettings;
};

type Config = {
  community: {
    alias: string;
    theme?: Theme;
  };
};

export const theme = (communityConfig: Config) => {
  const theme: Theme = communityConfig.community.theme || { primary: "#2FA087" };
  const communitySlug = communityConfig.community.alias;

  const defaults = {
    greeting: "Hello, citizen!",
    primary: "#2FA087",
    secondary: "#01392C",
    text: "#fff",
    nfc: {
      scannerLogo: "https://nfcwallet.xyz/nfc-scanner.svg",
      deviceName: "NFC wallet",
    },
  };

  defaultsDeep(theme, defaults, themes[communitySlug] || {});

  return theme;
};
