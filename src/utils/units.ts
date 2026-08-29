import type { TempUnit, Units, WindUnit } from "../types/weather";

/* ---------- temperature ---------- */

export function convertTemp(celsius: number, unit: TempUnit): number {
  return unit === "c" ? celsius : celsius * (9 / 5) + 32;
}

/** "17°" */
export function formatTemp(celsius: number, unit: TempUnit): string {
  return `${Math.round(convertTemp(celsius, unit))}°`;
}

/** "17°C" */
export function formatTempUnit(celsius: number, unit: TempUnit): string {
  return `${Math.round(convertTemp(celsius, unit))}°${unit === "c" ? "C" : "F"}`;
}

export const unitSymbol = (unit: TempUnit) => (unit === "c" ? "°C" : "°F");

/* ---------- wind ---------- */

export function convertWind(kmh: number, unit: WindUnit): number {
  return unit === "kmh" ? kmh : kmh / 1.609344;
}

/** "18 km/h" */
export function formatWind(kmh: number, unit: WindUnit): string {
  const v = Math.round(convertWind(kmh, unit));
  return `${v} ${unit === "kmh" ? "km/h" : "mph"}`;
}

const COMPASS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export function windCompass(degrees: number): string {
  return COMPASS[Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16];
}

/* ---------- precipitation & distance (follow the temperature system) ---------- */

export function formatPrecip(mm: number, unit: TempUnit): string {
  if (unit === "f") {
    return `${(mm * 0.0393701).toFixed(2)} in`;
  }
  return `${mm < 10 ? mm.toFixed(1) : Math.round(mm)} mm`;
}

export function formatVisibility(metres: number, unit: TempUnit): string {
  if (unit === "f") {
    const mi = metres / 1609.344;
    return `${mi >= 10 ? Math.round(mi) : mi.toFixed(1)} mi`;
  }
  const km = metres / 1000;
  return `${km >= 10 ? Math.round(km) : km.toFixed(1)} km`;
}

/* ---------- time (Open-Meteo strings are already in the place's local tz) ---------- */

/** "2025-08-29T21:00" -> "9 PM" */
export function formatHour(iso: string): string {
  const h = parseInt(iso.slice(11, 13), 10);
  const suffix = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${suffix}`;
}

/** "2025-08-29T06:15" -> "6:15 AM" */
export function formatClock(iso: string): string {
  const h = parseInt(iso.slice(11, 13), 10);
  const m = iso.slice(14, 16);
  const suffix = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${m} ${suffix}`;
}

/** "2025-08-29T15:15" -> "Friday, 29 August" */
export function formatFullDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Day label for a "YYYY-MM-DD" string at the given index in the daily array. */
export function dayLabel(dateStr: string, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "long" });
}

/** Short date like "29 Aug" for a "YYYY-MM-DD" string. */
export function shortDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/* ---------- derived helpers ---------- */

/** Index in `hourly.time` matching the hour of `currentTime`. */
export function currentHourIndex(hourTimes: string[], currentTime: string): number {
  const prefix = currentTime.slice(0, 13);
  const idx = hourTimes.findIndex((t) => t.slice(0, 13) === prefix);
  return idx === -1 ? 0 : idx;
}

export function placeKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

export function describeHumidity(pct: number): string {
  if (pct < 30) return "Dry";
  if (pct < 60) return "Comfortable";
  if (pct < 75) return "A little humid";
  return "Humid";
}

export function describeVisibility(metres: number): string {
  if (metres >= 20000) return "Excellent";
  if (metres >= 10000) return "Good";
  if (metres >= 4000) return "Moderate";
  return "Poor";
}

export function describeCloud(pct: number): string {
  if (pct < 20) return "Mostly clear skies";
  if (pct < 50) return "Scattered clouds";
  if (pct < 80) return "Broken clouds";
  return "Full overcast";
}

export function describeWind(kmh: number): string {
  if (kmh < 12) return "Light air";
  if (kmh < 25) return "Gentle breeze";
  if (kmh < 40) return "Fresh breeze";
  return "Strong wind";
}

export { type Units };
