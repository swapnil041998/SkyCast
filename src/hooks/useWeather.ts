import { useCallback, useRef, useState } from "react";
import { fetchWeather, WeatherApiError } from "../services/weatherApi";
import type { SelectedPlace, WeatherBundle } from "../types/weather";

interface CacheEntry {
  at: number;
  data: WeatherBundle;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface UseWeatherResult {
  data: WeatherBundle | null;
  place: SelectedPlace | null;
  loading: boolean;
  error: string | null;
  load: (place: SelectedPlace, opts?: { force?: boolean }) => Promise<void>;
  retry: () => void;
}

/**
 * Loads weather for a selected place. Keeps a short-lived cache so that
 * switching between favourites or re-selecting a city does not hit the
 * network again, and aborts in-flight requests when a new place is chosen.
 */
export function useWeather(): UseWeatherResult {
  const [data, setData] = useState<WeatherBundle | null>(null);
  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const placeRef = useRef<SelectedPlace | null>(null);

  const load = useCallback(
    async (next: SelectedPlace, opts?: { force?: boolean }) => {
      const key = `${next.latitude.toFixed(2)},${next.longitude.toFixed(2)}`;
      const cached = cacheRef.current.get(key);
      placeRef.current = next;

      if (cached && !opts?.force && Date.now() - cached.at < CACHE_TTL_MS) {
        abortRef.current?.abort();
        setPlace(next);
        setData(cached.data);
        setError(null);
        setLoading(false);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const bundle = await fetchWeather(
          next.latitude,
          next.longitude,
          controller.signal
        );
        if (placeRef.current !== next) return; // a newer request superseded us
        cacheRef.current.set(key, { at: Date.now(), data: bundle });
        setPlace(next);
        setData(bundle);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        if (placeRef.current !== next) return;
        setData(null);
        setError(
          err instanceof WeatherApiError
            ? err.message
            : "Something went wrong while loading the weather. Please try again."
        );
      } finally {
        if (placeRef.current === next && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  const retry = useCallback(() => {
    if (placeRef.current) void load(placeRef.current, { force: true });
  }, [load]);

  return { data, place, loading, error, load, retry };
}
