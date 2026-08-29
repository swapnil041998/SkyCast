import {
  Sun,
  SunDim,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudHail,
  CloudSnow,
  CloudSunRain,
  CloudMoonRain,
  CloudLightning,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Coarse sky families used to drive the dynamic backdrop. */
export type SkyKind =
  | "clear"
  | "partly"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "sleet"
  | "snow"
  | "thunder";

export interface CodeInfo {
  label: string;
  Icon: LucideIcon;
  kind: SkyKind;
}

const info = (label: string, Icon: LucideIcon, kind: SkyKind): CodeInfo => ({
  label,
  Icon,
  kind,
});

/**
 * Maps Open-Meteo WMO weather interpretation codes to a human readable
 * label, a Lucide icon and a sky family.
 */
export function describeCode(code: number, isDay: boolean): CodeInfo {
  switch (code) {
    case 0:
      return info("Clear sky", isDay ? Sun : Moon, "clear");
    case 1:
      return info("Mainly clear", isDay ? SunDim : Moon, "clear");
    case 2:
      return info("Partly cloudy", isDay ? CloudSun : CloudMoon, "partly");
    case 3:
      return info("Overcast", Cloud, "cloudy");
    case 45:
    case 48:
      return info(code === 48 ? "Rime fog" : "Fog", CloudFog, "fog");
    case 51:
      return info("Light drizzle", CloudDrizzle, "drizzle");
    case 53:
      return info("Drizzle", CloudDrizzle, "drizzle");
    case 55:
      return info("Dense drizzle", CloudDrizzle, "drizzle");
    case 56:
    case 57:
      return info("Freezing drizzle", CloudDrizzle, "sleet");
    case 61:
      return info("Light rain", CloudRain, "rain");
    case 63:
      return info("Rain", CloudRain, "rain");
    case 65:
      return info("Heavy rain", CloudRainWind, "rain");
    case 66:
    case 67:
      return info("Freezing rain", CloudHail, "sleet");
    case 71:
      return info("Light snow", CloudSnow, "snow");
    case 73:
      return info("Snow", CloudSnow, "snow");
    case 75:
      return info("Heavy snow", CloudSnow, "snow");
    case 77:
      return info("Snow grains", CloudSnow, "snow");
    case 80:
      return info("Light showers", isDay ? CloudSunRain : CloudMoonRain, "rain");
    case 81:
      return info("Rain showers", CloudRain, "rain");
    case 82:
      return info("Heavy showers", CloudRainWind, "rain");
    case 85:
      return info("Snow showers", CloudSnow, "snow");
    case 86:
      return info("Heavy snow showers", CloudSnow, "snow");
    case 95:
      return info("Thunderstorm", CloudLightning, "thunder");
    case 96:
    case 99:
      return info("Thunderstorm with hail", CloudLightning, "thunder");
    default:
      return info("Unknown", Cloud, "cloudy");
  }
}

/** Icon tint used on light surfaces (detail tiles, lists). */
export const kindTint: Record<SkyKind, string> = {
  clear: "text-amber-500 dark:text-amber-300",
  partly: "text-amber-500 dark:text-amber-300",
  cloudy: "text-slate-500 dark:text-slate-300",
  fog: "text-slate-400 dark:text-slate-300",
  drizzle: "text-cyan-600 dark:text-cyan-300",
  rain: "text-sky-600 dark:text-sky-300",
  sleet: "text-cyan-600 dark:text-cyan-300",
  snow: "text-sky-500 dark:text-sky-200",
  thunder: "text-amber-500 dark:text-yellow-300",
};

/** Icon tint used over the saturated hero backdrop (always light text). */
export const heroTint: Record<SkyKind, string> = {
  clear: "text-amber-200",
  partly: "text-amber-100",
  cloudy: "text-slate-100",
  fog: "text-slate-100",
  drizzle: "text-cyan-100",
  rain: "text-sky-100",
  sleet: "text-cyan-100",
  snow: "text-sky-100",
  thunder: "text-yellow-200",
};

/** Maps a sky family + day/night to the hero backdrop class name. */
export function backdropClass(kind: SkyKind, isDay: boolean): string {
  switch (kind) {
    case "clear":
      return isDay ? "wb-clear-day" : "wb-clear-night";
    case "partly":
      return isDay ? "wb-partly-day" : "wb-partly-night";
    case "cloudy":
      return isDay ? "wb-cloudy-day" : "wb-cloudy-night";
    case "fog":
      return isDay ? "wb-fog-day" : "wb-fog-night";
    case "drizzle":
    case "rain":
    case "sleet":
      return isDay ? "wb-rain-day" : "wb-rain-night";
    case "snow":
      return isDay ? "wb-snow-day" : "wb-snow-night";
    case "thunder":
      return isDay ? "wb-thunder-day" : "wb-thunder-night";
  }
}
