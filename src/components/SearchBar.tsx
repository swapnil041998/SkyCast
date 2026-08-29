import { useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPin, Search, X, TriangleAlert } from "lucide-react";
import { reverseGeocode, searchCities } from "../services/weatherApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { GeoResult, SelectedPlace } from "../types/weather";

interface Props {
  onSelect: (place: SelectedPlace) => void;
}

type GeoStatus = "idle" | "locating" | "denied" | "unavailable";

export function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [active, setActive] = useState(-1);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  const debounced = useDebouncedValue(query.trim(), 300);
  const wrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* debounced autocomplete requests — one in-flight request at a time */
  useEffect(() => {
    if (debounced.length < 2) {
      setResults([]);
      setSearching(false);
      setSearchFailed(false);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setSearching(true);
    setSearchFailed(false);

    searchCities(debounced, controller.signal)
      .then((r) => {
        setResults(r);
        setActive(r.length > 0 ? 0 : -1);
        setOpen(true);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setResults([]);
          setSearchFailed(true);
          setOpen(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setSearching(false);
      });

    return () => controller.abort();
  }, [debounced]);

  /* close on outside click */
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const pick = (r: GeoResult) => {
    onSelect({
      name: r.name,
      region: r.admin1,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
    });
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = active >= 0 ? active : 0;
      if (results[idx]) pick(results[idx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unavailable");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const place = await reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude
        );
        setGeoStatus("idle");
        onSelect(place);
      },
      () => setGeoStatus("denied"),
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  const geoNote =
    geoStatus === "denied"
      ? "Location access was denied — no problem, search for a city instead."
      : geoStatus === "unavailable"
        ? "Location isn't available in this browser — search for a city instead."
        : null;

  return (
    <div ref={wrapRef} className="relative z-30">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4.5 top-1/2 h-5 w-5 -translate-y-1/2 text-mute"
            aria-hidden="true"
          />
          <input
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="city-listbox"
            aria-activedescendant={active >= 0 ? `city-opt-${active}` : undefined}
            aria-label="Search for a city"
            aria-autocomplete="list"
            autoComplete="off"
            placeholder="Search for a city…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchFailed(false);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => {
              if (results.length > 0 || searchFailed) setOpen(true);
            }}
            className="h-14 w-full rounded-2xl border border-edge bg-surface pl-12 pr-12 text-base font-medium text-ink shadow-sm outline-none transition-all duration-200 placeholder:text-mute/80 focus:border-accent/60 focus:shadow-lg focus:shadow-accent/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-mute transition-colors hover:bg-raise hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {open && (
            <div
              id="city-listbox"
              role="listbox"
              aria-label="City suggestions"
              className="fade-in absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-edge bg-surface shadow-xl shadow-black/10"
            >
              {searching ? (
                <p className="flex items-center gap-2.5 px-4.5 py-4 text-sm text-mute">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Searching places…
                </p>
              ) : searchFailed ? (
                <p className="px-4.5 py-4 text-sm text-mute">
                  Search is unavailable right now. Please try again.
                </p>
              ) : results.length === 0 ? (
                <p className="px-4.5 py-4 text-sm text-mute">
                  We couldn&rsquo;t find that location. Try searching for another
                  city.
                </p>
              ) : (
                <ul className="max-h-80 overflow-y-auto scroll-slim p-1.5">
                  {results.map((r, i) => (
                    <li key={`${r.id}-${i}`} role="option" id={`city-opt-${i}`} aria-selected={i === active}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pick(r)}
                        onMouseEnter={() => setActive(i)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          i === active ? "bg-accent/10" : "hover:bg-raise"
                        }`}
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${i === active ? "bg-accent/15 text-accent" : "bg-raise text-mute"}`}>
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {r.name}
                          </span>
                          <span className="block truncate text-xs text-mute">
                            {[r.admin1, r.country].filter(Boolean).join(", ") ||
                              "—"}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={locate}
          disabled={geoStatus === "locating"}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-edge bg-surface px-5 text-sm font-semibold text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent hover:shadow-md disabled:cursor-wait disabled:opacity-70"
        >
          {geoStatus === "locating" ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed className="h-4.5 w-4.5" aria-hidden="true" />
          )}
          <span className="whitespace-nowrap">Use my location</span>
        </button>
      </div>

      {geoNote && (
        <p
          role="status"
          className="fade-in mt-2.5 flex items-center gap-2 rounded-xl border border-solar/40 bg-solar/10 px-4 py-2.5 text-sm font-medium text-ink"
        >
          <TriangleAlert className="h-4 w-4 shrink-0 text-solar" aria-hidden="true" />
          {geoNote}
        </p>
      )}
    </div>
  );
}
