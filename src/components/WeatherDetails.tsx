import {
  Activity,
  Cloud,
  CloudRain,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Units, WeatherBundle } from "../types/weather";
import {
  currentHourIndex,
  describeCloud,
  describeHumidity,
  describeVisibility,
  describeWind,
  formatClock,
  formatPrecip,
  formatVisibility,
  formatWind,
  windCompass,
} from "../utils/units";

interface Props {
  data: WeatherBundle;
  units: Units;
}

interface Tile {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
  note: string;
}

export function WeatherDetails({ data, units }: Props) {
  const { current, daily, hourly } = data;
  const hIdx = currentHourIndex(hourly.time, current.time);
  const visibility = hourly.visibility?.[hIdx];

  const tiles: Tile[] = [
    {
      icon: Droplets,
      iconClass: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
      label: "Humidity",
      value: `${Math.round(current.relative_humidity_2m)}%`,
      note: describeHumidity(current.relative_humidity_2m),
    },
    {
      icon: Wind,
      iconClass: "bg-teal-500/12 text-teal-600 dark:text-teal-300",
      label: "Wind",
      value: formatWind(current.wind_speed_10m, units.wind),
      note: `${windCompass(current.wind_direction_10m)} · ${describeWind(current.wind_speed_10m)}`,
    },
    {
      icon: CloudRain,
      iconClass: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-300",
      label: "Precipitation",
      value: formatPrecip(daily.precipitation_sum[0] ?? 0, units.temp),
      note: `Right now: ${formatPrecip(current.precipitation, units.temp)}`,
    },
    {
      icon: Cloud,
      iconClass: "bg-slate-500/12 text-slate-500 dark:text-slate-300",
      label: "Cloud cover",
      value: `${Math.round(current.cloud_cover)}%`,
      note: describeCloud(current.cloud_cover),
    },
    {
      icon: Gauge,
      iconClass: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
      label: "Pressure",
      value: `${Math.round(current.pressure_msl)} hPa`,
      note: "Sea level",
    },
    {
      icon: Eye,
      iconClass: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-300",
      label: "Visibility",
      value: visibility != null ? formatVisibility(visibility, units.temp) : "—",
      note: visibility != null ? describeVisibility(visibility) : "No data",
    },
    {
      icon: Sunrise,
      iconClass: "bg-orange-500/12 text-orange-600 dark:text-orange-300",
      label: "Sunrise",
      value: formatClock(daily.sunrise[0]),
      note: "Local time",
    },
    {
      icon: Sunset,
      iconClass: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
      label: "Sunset",
      value: formatClock(daily.sunset[0]),
      note: "Local time",
    },
  ];

  return (
    <section aria-labelledby="details-title">
      <h3
        id="details-title"
        className="font-display mb-3 flex items-center gap-2 px-1 text-lg font-bold text-ink"
      >
        <Activity className="h-5 w-5 text-accent" aria-hidden="true" />
        Weather details
      </h3>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <li
            key={t.label}
            className="rise rounded-2xl border border-edge bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${t.iconClass}`}>
                <t.icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-mute">
                {t.label}
              </span>
            </div>
            <p className="mt-3 text-xl font-bold tabular-nums text-ink">{t.value}</p>
            <p className="mt-0.5 text-xs font-medium text-mute">{t.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
