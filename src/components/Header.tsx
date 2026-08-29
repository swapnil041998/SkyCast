import { CloudSun } from "lucide-react";
import type { SelectedPlace, Theme, Units } from "../types/weather";
import { ThemeToggle, UnitToggle } from "./Controls";
import { FavouriteCities } from "./FavouriteCities";

interface Props {
  units: Units;
  onUnitsChange: (units: Units) => void;
  theme: Theme;
  onThemeToggle: () => void;
  favourites: SelectedPlace[];
  activeKey: string | null;
  onSelectFavourite: (place: SelectedPlace) => void;
  onRemoveFavourite: (place: SelectedPlace) => void;
}

export function Header({
  units,
  onUnitsChange,
  theme,
  onThemeToggle,
  favourites,
  activeKey,
  onSelectFavourite,
  onRemoveFavourite,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-edge/70 bg-canvas/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          aria-label="SkyCast home"
          className="flex items-center gap-2.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-sky-400 text-white shadow-md shadow-accent/25">
            <CloudSun className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Sky<span className="text-accent">Cast</span>
          </span>
        </a>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <UnitToggle units={units} onChange={onUnitsChange} />
          <FavouriteCities
            favourites={favourites}
            activeKey={activeKey}
            onSelect={onSelectFavourite}
            onRemove={onRemoveFavourite}
          />
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
      </div>
    </header>
  );
}
