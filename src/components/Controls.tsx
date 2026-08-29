import { Moon, Sun } from "lucide-react";
import type { Theme, Units } from "../types/weather";

interface SegmentedProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function Segmented({ label, options, value, onChange }: SegmentedProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center rounded-full border border-edge bg-raise p-0.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums transition-all duration-200 ${
              active
                ? "bg-surface text-ink shadow-sm"
                : "text-mute hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface UnitToggleProps {
  units: Units;
  onChange: (units: Units) => void;
}

/** Temperature (°C/°F) and wind (km/h / mph) selectors. */
export function UnitToggle({ units, onChange }: UnitToggleProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Segmented
        label="Temperature unit"
        value={units.temp}
        onChange={(v) => onChange({ ...units, temp: v as Units["temp"] })}
        options={[
          { value: "c", label: "°C" },
          { value: "f", label: "°F" },
        ]}
      />
      <Segmented
        label="Wind speed unit"
        value={units.wind}
        onChange={(v) => onChange({ ...units, wind: v as Units["wind"] })}
        options={[
          { value: "kmh", label: "km/h" },
          { value: "mph", label: "mph" },
        ]}
      />
    </div>
  );
}

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-9 w-9 place-items-center rounded-full border border-edge bg-surface text-mute transition-all duration-200 hover:-translate-y-0.5 hover:text-solar hover:shadow-md"
    >
      {dark ? (
        <Sun key="sun" className="pop h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Moon key="moon" className="pop h-4.5 w-4.5" aria-hidden="true" />
      )}
    </button>
  );
}
