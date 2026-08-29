import { useCallback, useEffect, useState } from "react";
import { CloudSun } from "lucide-react";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { CurrentWeather } from "./components/CurrentWeather";
import { WeatherSummary } from "./components/WeatherSummary";
import { PlanYourDay } from "./components/PlanYourDay";
import { HourlyForecast } from "./components/HourlyForecast";
import { TemperatureChart } from "./components/TemperatureChart";
import { WeeklyForecast } from "./components/WeeklyForecast";
import { WeatherDetails } from "./components/WeatherDetails";
import { EmptyState, ErrorState, LoadingState } from "./components/States";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useWeather } from "./hooks/useWeather";
import { describeCode, type SkyKind } from "./utils/weatherCodes";
import { placeKey } from "./utils/units";
import type { SelectedPlace, Theme, Units } from "./types/weather";

/** Subtle page-level tint keyed to the current sky — never distracting. */
function ambientBackground(kind: SkyKind, isDay: boolean, theme: Theme): string {
  const base = "var(--canvas)";
  const tint = (k: SkyKind, day: boolean, dark: boolean): [string, string] => {
    if (dark) {
      switch (k) {
        case "clear": return day ? ["rgba(38,120,160,0.20)", "rgba(255,180,90,0.06)"] : ["rgba(46,74,120,0.22)", "rgba(120,160,220,0.06)"];
        case "partly": return day ? ["rgba(40,110,150,0.18)", "rgba(255,180,90,0.05)"] : ["rgba(46,74,120,0.18)", "rgba(120,160,220,0.05)"];
        case "cloudy": return ["rgba(70,95,115,0.18)", "rgba(110,140,160,0.07)"];
        case "fog": return ["rgba(95,115,130,0.20)", "rgba(140,160,175,0.08)"];
        case "drizzle":
        case "rain":
        case "sleet": return ["rgba(38,105,150,0.20)", "rgba(80,150,190,0.08)"];
        case "snow": return ["rgba(90,140,180,0.18)", "rgba(160,200,230,0.08)"];
        case "thunder": return ["rgba(70,85,110,0.24)", "rgba(255,200,120,0.05)"];
      }
    }
    switch (k) {
      case "clear": return day ? ["rgba(255,196,90,0.20)", "rgba(70,180,220,0.14)"] : ["rgba(70,110,170,0.14)", "rgba(255,200,120,0.08)"];
      case "partly": return day ? ["rgba(255,200,100,0.16)", "rgba(90,180,215,0.13)"] : ["rgba(70,110,170,0.12)", "rgba(255,200,120,0.06)"];
      case "cloudy": return ["rgba(130,155,175,0.18)", "rgba(160,185,200,0.12)"];
      case "fog": return ["rgba(150,168,180,0.20)", "rgba(180,198,208,0.14)"];
      case "drizzle":
      case "rain":
      case "sleet": return ["rgba(70,150,195,0.16)", "rgba(110,175,205,0.10)"];
      case "snow": return ["rgba(140,185,220,0.18)", "rgba(190,215,235,0.14)"];
      case "thunder": return ["rgba(100,115,140,0.20)", "rgba(255,205,130,0.10)"];
    }
  };

  const [a, b] = tint(kind, isDay, theme === "dark");
  return `radial-gradient(1100px 540px at 85% -8%, ${a}, transparent 70%), radial-gradient(900px 480px at -12% 22%, ${b}, transparent 70%), ${base}`;
}

export default function App() {
  const [units, setUnits] = useLocalStorage<Units>("skycast:units", {
    temp: "c",
    wind: "kmh",
  });
  const [theme, setTheme] = useLocalStorage<Theme>("skycast:theme", () =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );
  const [favourites, setFavourites] = useLocalStorage<SelectedPlace[]>(
    "skycast:favourites",
    []
  );
  const [lastPlace, setLastPlace] = useLocalStorage<SelectedPlace | null>(
    "skycast:last-place",
    null
  );

  const { data, place, loading, error, load, retry } = useWeather();
  const [requestedName, setRequestedName] = useState<string | null>(null);

  /* restore the last viewed place on first load */
  useEffect(() => {
    if (lastPlace) {
      setRequestedName(lastPlace.name);
      void load(lastPlace);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleSelect = useCallback(
    (p: SelectedPlace) => {
      setRequestedName(p.name);
      setLastPlace(p);
      void load(p);
    },
    [load, setLastPlace]
  );

  const activeKey = place ? placeKey(place.latitude, place.longitude) : null;
  const isFavourite =
    activeKey != null &&
    favourites.some((f) => placeKey(f.latitude, f.longitude) === activeKey);

  const toggleFavourite = useCallback(() => {
    if (!place) return;
    if (isFavourite) {
      setFavourites((prev) =>
        prev.filter(
          (f) => placeKey(f.latitude, f.longitude) !== placeKey(place.latitude, place.longitude)
        )
      );
    } else {
      setFavourites((prev) => [...prev, place]);
    }
  }, [place, isFavourite, setFavourites]);

  const sky = data
    ? describeCode(data.current.weather_code, data.current.is_day === 1)
    : null;

  const liveStatus = loading
    ? `Loading weather for ${requestedName ?? "your chosen place"}…`
    : error
      ? error
      : place
        ? `Showing weather for ${place.name}.`
        : "";

  return (
    <div className="min-h-screen text-ink transition-colors duration-300">
      {sky && data && (
        <div
          key={`${sky.kind}-${data.current.is_day}-${theme}`}
          className="fade-in pointer-events-none fixed inset-0 -z-10"
          style={{ background: ambientBackground(sky.kind, data.current.is_day === 1, theme) }}
          aria-hidden="true"
        />
      )}

      <Header
        units={units}
        onUnitsChange={setUnits}
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        favourites={favourites}
        activeKey={activeKey}
        onSelectFavourite={handleSelect}
        onRemoveFavourite={(p) =>
          setFavourites((prev) =>
            prev.filter(
              (f) => placeKey(f.latitude, f.longitude) !== placeKey(p.latitude, p.longitude)
            )
          )
        }
      />

      <main className="relative mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-7 sm:px-6 sm:py-8">
        <SearchBar onSelect={handleSelect} />

        <div aria-live="polite" className="sr-only">
          {liveStatus}
        </div>

        {loading ? (
          <LoadingState placeName={requestedName ?? undefined} />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : data && place ? (
          <div key={activeKey ?? "place"} className="space-y-6 sm:space-y-7">
            <CurrentWeather
              place={place}
              data={data}
              units={units}
              isFavourite={isFavourite}
              onToggleFavourite={toggleFavourite}
            />

            <div className="grid gap-6 sm:gap-7 lg:grid-cols-12">
              <div className="space-y-6 sm:space-y-7 lg:col-span-7">
                <HourlyForecast data={data} units={units} />
                <div style={{ animationDelay: "80ms" }} className="rise">
                  <TemperatureChart data={data} units={units} />
                </div>
              </div>
              <div className="space-y-6 sm:space-y-7 lg:col-span-5">
                <div style={{ animationDelay: "140ms" }} className="rise">
                  <WeatherSummary data={data} units={units} />
                </div>
                <div style={{ animationDelay: "200ms" }} className="rise">
                  <PlanYourDay data={data} units={units} />
                </div>
              </div>
            </div>

            <div style={{ animationDelay: "120ms" }} className="rise">
              <WeeklyForecast data={data} units={units} />
            </div>

            <WeatherDetails data={data} units={units} />
          </div>
        ) : (
          <EmptyState onPick={handleSelect} />
        )}
      </main>

      <footer className="mt-4 border-t border-edge/70 transition-colors duration-300">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs font-medium text-mute sm:flex-row sm:px-6">
          <p className="flex items-center gap-1.5">
            <CloudSun className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>
              <span className="font-bold text-ink">SkyCast</span> — live forecasts
              powered by the open-source Open-Meteo API.
            </span>
          </p>
          <p>No account · No API key · Preferences stay on this device.</p>
        </div>
      </footer>
    </div>
  );
}
