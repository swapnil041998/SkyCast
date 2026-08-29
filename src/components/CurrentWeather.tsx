import { Droplets, Eye, Gauge, Star, Umbrella, Wind } from "lucide-react";
import type { SelectedPlace, Units, WeatherBundle } from "../types/weather";
import { describeCode, heroTint } from "../utils/weatherCodes";
import { WeatherBackdrop } from "./WeatherBackdrop";
import {
  currentHourIndex,
  formatClock,
  formatFullDate,
  formatTemp,
  formatTempUnit,
  formatVisibility,
  formatWind,
} from "../utils/units";

interface Props {
  place: SelectedPlace;
  data: WeatherBundle;
  units: Units;
  isFavourite: boolean;
  onToggleFavourite: () => void;
}

export function CurrentWeather({ place, data, units, isFavourite, onToggleFavourite }: Props) {
  const { current, daily, hourly } = data;
  const isDay = current.is_day === 1;
  const { label, Icon, kind } = describeCode(current.weather_code, isDay);

  const hIdx = currentHourIndex(hourly.time, current.time);
  const visibility = hourly.visibility?.[hIdx];
  const rainChance = daily.precipitation_probability_max?.[0] ?? 0;
  const locationLine = [place.region, place.country].filter(Boolean).join(", ");

  const stats: {
    label: string;
    value: string;
    icon: typeof Droplets;
    hidden?: boolean;
  }[] = [
    {
      label: "Humidity",
      value: `${Math.round(current.relative_humidity_2m)}%`,
      icon: Droplets,
    },
    {
      label: "Wind",
      value: formatWind(current.wind_speed_10m, units.wind),
      icon: Wind,
    },
    {
      label: "Rain",
      value: `${Math.round(rainChance)}%`,
      icon: Umbrella,
    },
    {
      label: "Pressure",
      value: `${Math.round(current.pressure_msl)} hPa`,
      icon: Gauge,
    },
    {
      label: "Visibility",
      value: visibility != null ? formatVisibility(visibility, units.temp) : "—",
      icon: Eye,
      hidden: visibility == null,
    },
  ];

  return (
    <section
      aria-label={`Current weather in ${place.name}`}
      className="rise relative overflow-hidden rounded-[28px] text-white shadow-xl shadow-black/10"
    >
      <WeatherBackdrop kind={kind} isDay={isDay} />

      <div className="relative p-6 sm:p-9">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {place.name}
              {locationLine && (
                <span className="font-sans text-base font-medium text-white/70 sm:text-lg">
                  {" "}
                  · {locationLine}
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm font-medium text-white/70">
              {formatFullDate(current.time)}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleFavourite}
            aria-pressed={isFavourite}
            aria-label={
              isFavourite
                ? `Remove ${place.name} from favourites`
                : `Add ${place.name} to favourites`
            }
            title={isFavourite ? "Remove from favourites" : "Save to favourites"}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/25"
          >
            <Star
              key={String(isFavourite)}
              className={`pop h-5 w-5 ${isFavourite ? "text-solar" : ""}`}
              fill={isFavourite ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-start">
              <span className="font-display text-[84px] font-extrabold leading-none tracking-tighter tabular-nums sm:text-[116px]">
                {formatTemp(current.temperature_2m, units.temp).replace("°", "")}
              </span>
              <span className="font-display mt-2 text-3xl font-bold text-white/80 sm:mt-4 sm:text-4xl">
                °{units.temp === "c" ? "C" : "F"}
              </span>
            </div>
            <p className="mt-3 flex items-center gap-2.5 text-lg font-semibold">
              <Icon className={`h-6 w-6 ${heroTint[kind]}`} aria-hidden="true" />
              {label}
            </p>
            <p className="mt-1 text-sm font-medium text-white/70">
              Feels like {formatTempUnit(current.apparent_temperature, units.temp)}
            </p>
          </div>

          <Icon
            className={`hidden h-32 w-32 drop-shadow-lg sm:block ${heroTint[kind]}`}
            strokeWidth={1.25}
            aria-hidden="true"
          />
        </div>

        <ul className="mt-9 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {stats
            .filter((s) => !s.hidden)
            .map((s) => (
              <li
                key={s.label}
                className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm transition-colors duration-200 hover:bg-white/18"
              >
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/65">
                  <s.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {s.label}
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums">{s.value}</p>
              </li>
            ))}
        </ul>

        <p className="mt-5 text-xs font-medium text-white/55">
          Updated {formatClock(current.time)} local time
          {data.timezone ? ` · ${data.timezone}` : ""}
        </p>
      </div>
    </section>
  );
}
