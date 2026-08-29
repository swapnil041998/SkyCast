import { useRef } from "react";
import { ChevronLeft, ChevronRight, Clock3, Droplets } from "lucide-react";
import type { Units, WeatherBundle } from "../types/weather";
import { describeCode, kindTint } from "../utils/weatherCodes";
import { currentHourIndex, formatTemp } from "../utils/units";

interface Props {
  data: WeatherBundle;
  units: Units;
}

export function HourlyForecast({ data, units }: Props) {
  const { hourly } = data;
  const scrollRef = useRef<HTMLDivElement>(null);
  const start = currentHourIndex(hourly.time, data.current.time);
  const hours = hourly.time.slice(start, start + 24);

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section
      aria-labelledby="hourly-title"
      className="rise rounded-3xl border border-edge bg-surface p-5 shadow-sm transition-colors duration-300 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3
          id="hourly-title"
          className="font-display flex items-center gap-2 text-lg font-bold text-ink"
        >
          <Clock3 className="h-5 w-5 text-accent" aria-hidden="true" />
          Hourly forecast
        </h3>
        <div className="hidden gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll hourly forecast backwards"
            className="grid h-8 w-8 place-items-center rounded-full border border-edge bg-raise text-mute transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll hourly forecast forwards"
            className="grid h-8 w-8 place-items-center rounded-full border border-edge bg-raise text-mute transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          role="list"
          aria-label="Next 24 hours"
          className="no-scrollbar -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1"
        >
          {hours.map((iso, i) => {
            const idx = start + i;
            const isNow = i === 0;
            const hourIsDay = hourly.is_day[idx] === 1;
            const { label, Icon, kind } = describeCode(
              hourly.weather_code[idx],
              hourIsDay
            );
            const pop = Math.round(hourly.precipitation_probability[idx] ?? 0);
            const temp = formatTemp(hourly.temperature_2m[idx], units.temp);
            const time = formatHourLabel(iso, isNow);

            return (
              <div
                key={iso}
                role="listitem"
                aria-label={`${time}: ${temp}, ${label}, ${pop}% chance of rain`}
                className={`flex w-[76px] shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl px-2 py-4 transition-all duration-200 ${
                  isNow
                    ? "bg-accent text-white shadow-lg shadow-accent/25"
                    : "bg-raise text-ink hover:-translate-y-1 hover:shadow-md"
                }`}
              >
                <span
                  className={`text-[11px] font-bold uppercase tracking-wide ${
                    isNow ? "text-white/85" : "text-mute"
                  }`}
                >
                  {time}
                </span>
                <Icon
                  className={`h-6 w-6 ${isNow ? "text-white" : kindTint[kind]}`}
                  aria-hidden="true"
                />
                <span className="text-sm font-bold tabular-nums">{temp}</span>
                <span
                  className={`flex items-center gap-1 text-[11px] font-semibold tabular-nums ${
                    isNow
                      ? "text-white/85"
                      : pop >= 20
                        ? "text-accent"
                        : "text-mute/60"
                  }`}
                >
                  <Droplets className="h-3 w-3" aria-hidden="true" />
                  {pop}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-surface to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface to-transparent" aria-hidden="true" />
      </div>
    </section>
  );
}

function formatHourLabel(iso: string, isNow: boolean): string {
  if (isNow) return "Now";
  const h = parseInt(iso.slice(11, 13), 10);
  const suffix = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${suffix}`;
}
