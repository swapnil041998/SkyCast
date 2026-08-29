import type {
  GeoResult,
  SelectedPlace,
  WeatherBundle,
} from "../types/weather";

export type ApiErrorKind = "network" | "api" | "notfound";

export class WeatherApiError extends Error {
  kind: ApiErrorKind;
  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = "WeatherApiError";
    this.kind = kind;
  }
}

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

/** City autocomplete backed by the Open-Meteo geocoding API. */
export async function searchCities(
  query: string,
  signal?: AbortSignal
): Promise<GeoResult[]> {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new WeatherApiError(
      "network",
      "We couldn't reach the search service. Check your connection and try again."
    );
  }
  if (!res.ok) {
    throw new WeatherApiError(
      "api",
      "City search is temporarily unavailable. Please try again in a moment."
    );
  }
  const json = (await res.json()) as { results?: GeoResult[] };
  return json.results ?? [];
}

/** Turns coordinates into a human readable place name (best effort). */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<SelectedPlace> {
  const fallback: SelectedPlace = {
    name: "My location",
    latitude: lat,
    longitude: lon,
  };
  try {
    const res = await fetch(
      `${REVERSE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) return fallback;
    const json = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
    return {
      name: json.city || json.locality || fallback.name,
      region: json.principalSubdivision || undefined,
      country: json.countryName || undefined,
      latitude: lat,
      longitude: lon,
    };
  } catch {
    return fallback;
  }
}

/**
 * Fetches current + hourly + daily weather for a coordinate pair.
 * Values come back in metric units; conversion happens in the UI layer.
 * `timezone=auto` makes Open-Meteo return times in the place's own timezone.
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "rain",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "rain",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "visibility",
      "is_day",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "wind_speed_10m_max",
      "sunrise",
      "sunset",
    ].join(","),
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timezone: "auto",
    forecast_days: "7",
  });

  let res: Response;
  try {
    res = await fetch(`${FORECAST_URL}?${params.toString()}`, { signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new WeatherApiError(
      "network",
      "We couldn't reach the weather service. Check your connection and try again."
    );
  }

  if (!res.ok) {
    throw new WeatherApiError(
      "api",
      "The weather service returned an unexpected response. Please try again."
    );
  }

  const json = (await res.json()) as {
    current?: WeatherBundle["current"];
    hourly?: WeatherBundle["hourly"];
    daily?: WeatherBundle["daily"];
    timezone?: string;
    utc_offset_seconds?: number;
  };

  if (
    !json.current ||
    !json.hourly ||
    !json.daily ||
    !Array.isArray(json.hourly.time) ||
    json.hourly.time.length === 0
  ) {
    throw new WeatherApiError(
      "notfound",
      "We couldn't find weather data for that location. Try searching for another city."
    );
  }

  return {
    current: json.current,
    hourly: json.hourly,
    daily: json.daily,
    timezone: json.timezone ?? "",
    utcOffsetSeconds: json.utc_offset_seconds ?? 0,
  };
}
