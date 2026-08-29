import { useEffect, useRef, useState } from "react";
import { MapPin, Star, X } from "lucide-react";
import type { SelectedPlace } from "../types/weather";
import { placeKey } from "../utils/units";

interface Props {
  favourites: SelectedPlace[];
  activeKey: string | null;
  onSelect: (place: SelectedPlace) => void;
  onRemove: (place: SelectedPlace) => void;
}

/** Starred-cities trigger button + dropdown panel. */
export function FavouriteCities({ favourites, activeKey, onSelect, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Favourite cities (${favourites.length})`}
        title="Favourite cities"
        className={`relative grid h-9 w-9 place-items-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
          open
            ? "border-solar/60 bg-solar/15 text-solar"
            : "border-edge bg-surface text-mute hover:text-solar"
        }`}
      >
        <Star
          className="h-4.5 w-4.5"
          fill={favourites.length > 0 ? "currentColor" : "none"}
          aria-hidden="true"
        />
        {favourites.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-solar px-1 text-[10px] font-bold text-white">
            {favourites.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Favourite cities"
          className="fade-in absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-2xl border border-edge bg-surface shadow-xl shadow-black/10"
        >
          <div className="flex items-center justify-between border-b border-edge px-4 py-3">
            <h2 className="font-display text-sm font-bold text-ink">
              Favourite cities
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close favourites"
              className="grid h-7 w-7 place-items-center rounded-full text-mute transition-colors hover:bg-raise hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {favourites.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm leading-relaxed text-mute">
              No favourites yet.
              <br />
              Tap the <Star className="inline h-3.5 w-3.5 text-solar" aria-hidden="true" /> on any
              city to pin it here.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto scroll-slim p-1.5">
              {favourites.map((f) => {
                const key = placeKey(f.latitude, f.longitude);
                const active = key === activeKey;
                return (
                  <li key={key} className="group flex items-center gap-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onSelect(f);
                        setOpen(false);
                      }}
                      className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                        active ? "bg-accent/10 text-accent" : "hover:bg-raise"
                      }`}
                    >
                      <Star
                        className="h-4 w-4 shrink-0 text-solar"
                        fill="currentColor"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className={`block truncate text-sm font-semibold ${active ? "text-accent" : "text-ink"}`}>
                          {f.name}
                        </span>
                        <span className="block truncate text-xs text-mute">
                          {[f.region, f.country].filter(Boolean).join(", ") || "Pinned place"}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(f)}
                      aria-label={`Remove ${f.name} from favourites`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-mute opacity-60 transition-all hover:bg-raise hover:text-red-500 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center gap-1.5 border-t border-edge px-4 py-2.5 text-xs text-mute">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Stored on this device — no account needed.
          </div>
        </div>
      )}
    </div>
  );
}
