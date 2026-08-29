import { ArrowDown, ArrowUp, Sparkles, Umbrella, Wind } from "lucide-react";
import type { Units, WeatherBundle } from "../types/weather";
import { describeCode } from "../utils/weatherCodes";
import { formatClock, formatTempUnit, formatWind } from "../utils/units";

interface Props {
  data: WeatherBundle;
  units: Units;
}

function buildSummary(data: WeatherBundle, units: Units): string {
  const { current, daily } = data;
  const isDay = current.is_day === 1;
  const { label, kind } = describeCode(current.weather_code, isDay);

  const high = daily.temperature_2m_max[0];
  const windMax = daily.wind_speed_10m_max[0];
  const prob = daily.precipitation_probability_max[0] ?? 0;

  const tempWord =
    high <= 0 ? "Freezing" :
    high <= 8 ? "Cold" :
    high <= 16 ? "Cool" :
    high <= 23 ? "Mild" :
    high <= 30 ? "Warm" : "Hot";

  const windWord =
    windMax < 12 ? "light" :
    windMax < 25 ? "moderate" :
    windMax < 40 ? "strong" : "very strong";

  const rainPart =
    prob >= 55
      ? `, with a ${Math.round(prob)}% chance of rain`
      : prob >= 25
        ? `, with a ${Math.round(prob)}% chance of showers`
        : "";

  const kindNote =
    kind === "fog"
      ? " Expect reduced visibility at times."
      : kind === "thunder"
        ? " Thunderstorms are possible — keep an eye on the sky."
        : kind === "snow"
          ? " Bundle up if you're heading out."
          : "";

  return `${tempWord} and ${label.toLowerCase()} today${rainPart}. Temperatures will reach ${formatTempUnit(high, units.temp)} in the afternoon, with ${windWord} winds up to ${formatWind(windMax, units.wind)} and humidity around ${Math.round(current.relative_humidity_2m)}%. The sun rises at ${formatClock(daily.sunrise[0])} and sets at ${formatClock(daily.sunset[0])}.${kindNote}`;
}

/** "Today's outlook" — a plain-language summary generated from live data. */
export function WeatherSummary({ data, units }: Props) {
  const { daily } = data;
  const summary = buildSummary(data, units);

  const chips = [
    {
      label: "High",
      value: formatTempUnit(daily.temperature_2m_max[0], units.temp),
      icon: ArrowUp,
    },
    {
      label: "Low",
      value: formatTempUnit(daily.temperature_2m_min[0], units.temp),
      icon: ArrowDown,
    },
    {
      label: "Rain chance",
      value: `${Math.round(daily.precipitation_probability_max[0] ?? 0)}%`,
      icon: Umbrella,
    },
    {
      label: "Max wind",
      value: formatWind(daily.wind_speed_10m_max[0], units.wind),
      icon: Wind,
    },
  ];

  return (
    <section
      aria-labelledby="outlook-title"
      className="rise rounded-3xl border border-edge bg-surface p-6 shadow-sm transition-colors duration-300"
    >
      <h3
        id="outlook-title"
        className="font-display flex items-center gap-2 text-lg font-bold text-ink"
      >
        <Sparkles className="h-5 w-5 text-solar" aria-hidden="true" />
        Today&rsquo;s outlook
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-mute">{summary}</p>

      <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {chips.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl bg-raise px-3.5 py-3 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mute">
              <c.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {c.label}
            </dt>
            <dd className="mt-1 text-base font-bold tabular-nums text-ink">
              {c.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
