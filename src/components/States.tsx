import { CloudOff, CloudSun, MapPin, RefreshCw } from "lucide-react";
import type { SelectedPlace } from "../types/weather";

function Sk({ className }: { className?: string }) {
  return <div className={`shimmer rounded-xl ${className ?? ""}`} aria-hidden="true" />;
}

/** Full-page skeleton dashboard shown while weather loads. */
export function LoadingState({ placeName }: { placeName?: string }) {
  return (
    <div className="space-y-6" role="status" aria-label="Loading weather">
      <span className="sr-only">
        Loading weather{placeName ? ` for ${placeName}` : ""}…
      </span>
      <div>
        <p className="mb-2 text-sm font-medium text-mute">Loading current weather…</p>
        <Sk className="h-[340px] rounded-[28px] sm:h-[400px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div>
            <p className="mb-2 text-sm font-medium text-mute">Loading hourly forecast…</p>
            <Sk className="h-44" />
          </div>
          <Sk className="h-72" />
        </div>
        <div className="space-y-6 lg:col-span-5">
          <Sk className="h-44" />
          <Sk className="h-64" />
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-mute">Loading 7-day forecast…</p>
        <div className="space-y-2">
          {Array.from({ length: 7 }, (_, i) => (
            <Sk key={i} className="h-14" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Sk key={i} className="h-28" />
        ))}
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rise mx-auto flex max-w-lg flex-col items-center rounded-[28px] border border-edge bg-surface px-8 py-14 text-center shadow-sm"
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-raise text-mute">
        <CloudOff className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="font-display mt-5 text-2xl font-bold text-ink">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-mute">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}

const POPULAR: (SelectedPlace & { country: string })[] = [
  { name: "Dublin", country: "Ireland", latitude: 53.3498, longitude: -6.2603 },
  { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
  { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 },
  { name: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777 },
  { name: "Tokyo", country: "Japan", latitude: 35.6764, longitude: 139.65 },
];

interface EmptyStateProps {
  onPick: (place: SelectedPlace) => void;
}

/** First-visit state: no place selected yet. */
export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <section className="rise relative overflow-hidden rounded-[28px] border border-edge bg-surface px-6 py-16 text-center shadow-sm sm:py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="wb-cloud" style={{ top: "16%", left: "8%", width: 190, height: 52, animationDuration: "24s" }} />
        <div className="wb-cloud" style={{ top: "60%", left: "70%", width: 240, height: 62, animationDuration: "32s", animationDelay: "-10s" }} />
        <div className="wb-cloud" style={{ top: "74%", left: "12%", width: 170, height: 46, animationDuration: "28s", animationDelay: "-18s" }} />
      </div>

      <div className="relative">
        <div className="float-y mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-accent to-sky-400 text-white shadow-lg shadow-accent/30">
          <CloudSun className="h-10 w-10" aria-hidden="true" />
        </div>
        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          What&rsquo;s the weather like?
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-base text-mute">
          Search for a city above to get started, or jump straight in with one
          of these places.
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {POPULAR.map((p) => (
            <li key={p.name}>
              <button
                type="button"
                onClick={() => onPick(p)}
                className="group inline-flex items-center gap-2 rounded-full border border-edge bg-raise px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent hover:shadow-md"
              >
                <MapPin className="h-4 w-4 text-mute transition-colors group-hover:text-accent" aria-hidden="true" />
                {p.name}
                <span className="font-normal text-mute">{p.country}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
