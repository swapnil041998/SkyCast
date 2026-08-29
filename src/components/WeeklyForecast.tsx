import { useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarDays, ChevronDown, Droplets, Sunrise, Sunset, Wind } from "lucide-react";
import type { Units, WeatherBundle } from "../types/weather";
import { describeCode, kindTint } from "../utils/weatherCodes";
import {
  dayLabel,
  formatClock,
  formatHour,
  formatPrecip,
  formatTemp,
  formatWind,
  shortDate,
} from "../utils/units";

interface Props {
  data: WeatherBundle;
  units: Units;
}

interface MiniPoint {
  time: string;
  temp: number;
  pop: number;
}

function MiniTip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MiniPoint }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-edge bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-ink">{p.time}</p>
      <p className="tabular-nums font-semibold text-accent">{Math.round(p.temp)}°</p>
      <p className="tabular-nums text-mute">{Math.round(p.pop)}% rain</p>
    </div>
  );
}

export function WeeklyForecast({ data, units }: Props) {
  const { daily, hourly } = data;
  const [expanded, setExpanded] = useState<number | null>(0);

  const weekMin = Math.min(...daily.temperature_2m_min);
  const weekMax = Math.max(...daily.temperature_2m_max);
  const span = Math.max(weekMax - weekMin, 1);

  return (
    <section
      aria-labelledby="weekly-title"
      className="rise rounded-3xl border border-edge bg-surface p-5 shadow-sm transition-colors duration-300 sm:p-6"
    >
      <h3
        id="weekly-title"
        className="font-display mb-4 flex items-center gap-2 text-lg font-bold text-ink"
      >
        <CalendarDays className="h-5 w-5 text-accent" aria-hidden="true" />
        7-day forecast
      </h3>

      <ul className="space-y-1.5">
        {daily.time.map((dateStr, d) => {
          const { label, Icon, kind } = describeCode(daily.weather_code[d], true);
          const pop = Math.round(daily.precipitation_probability_max[d] ?? 0);
          const min = daily.temperature_2m_min[d];
          const max = daily.temperature_2m_max[d];
          const open = expanded === d;
          const left = ((min - weekMin) / span) * 100;
          const width = ((max - min) / span) * 100;

          const hourIdxs: number[] = [];
          hourly.time.forEach((t, i) => {
            if (t.slice(0, 10) === dateStr) hourIdxs.push(i);
          });
          const miniData: MiniPoint[] = hourIdxs.map((i) => ({
            time: formatHour(hourly.time[i]),
            temp:
              units.temp === "c"
                ? hourly.temperature_2m[i]
                : hourly.temperature_2m[i] * (9 / 5) + 32,
            pop: hourly.precipitation_probability[i] ?? 0,
          }));

          return (
            <li key={dateStr} className="overflow-hidden rounded-2xl">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : d)}
                aria-expanded={open}
                aria-controls={`day-panel-${d}`}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 ${
                  open ? "bg-raise" : "hover:bg-raise"
                }`}
              >
                <span className="w-[74px] shrink-0 sm:w-[104px]">
                  <span className="block text-sm font-bold text-ink">
                    {dayLabel(dateStr, d)}
                  </span>
                  <span className="block text-xs font-medium text-mute">
                    {shortDate(dateStr)}
                  </span>
                </span>

                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Icon className={`h-6 w-6 shrink-0 ${kindTint[kind]}`} aria-hidden="true" />
                  <span className="hidden truncate text-sm font-semibold text-mute md:block">
                    {label}
                  </span>
                </span>

                <span
                  className={`flex w-14 shrink-0 items-center justify-end gap-1 text-xs font-bold tabular-nums ${
                    pop >= 20 ? "text-accent" : "text-mute/60"
                  }`}
                >
                  <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
                  {pop}%
                </span>

                <span className="hidden w-28 shrink-0 lg:block" aria-hidden="true">
                  <span className="range-track block">
                    <span
                      className="range-fill"
                      style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                    />
                  </span>
                </span>

                <span className="w-[86px] shrink-0 text-right text-sm font-bold tabular-nums text-ink">
                  {formatTemp(min, units.temp)}
                  <span className="mx-1 font-medium text-mute">/</span>
                  {formatTemp(max, units.temp)}
                </span>

                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-mute transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              <div id={`day-panel-${d}`} className={`expander ${open ? "open" : ""}`}>
                <div>
                  <div className="border-t border-edge bg-raise/60 px-4 py-4">
                    <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      <div className="rounded-xl bg-surface px-3.5 py-2.5">
                        <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mute">
                          <Sunrise className="h-3.5 w-3.5 text-solar" aria-hidden="true" />
                          Sunrise
                        </dt>
                        <dd className="mt-0.5 text-sm font-bold tabular-nums text-ink">
                          {formatClock(daily.sunrise[d])}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-surface px-3.5 py-2.5">
                        <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mute">
                          <Sunset className="h-3.5 w-3.5 text-solar" aria-hidden="true" />
                          Sunset
                        </dt>
                        <dd className="mt-0.5 text-sm font-bold tabular-nums text-ink">
                          {formatClock(daily.sunset[d])}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-surface px-3.5 py-2.5">
                        <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mute">
                          <Wind className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                          Max wind
                        </dt>
                        <dd className="mt-0.5 text-sm font-bold tabular-nums text-ink">
                          {formatWind(daily.wind_speed_10m_max[d], units.wind)}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-surface px-3.5 py-2.5">
                        <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mute">
                          <Droplets className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                          Rain
                        </dt>
                        <dd className="mt-0.5 text-sm font-bold tabular-nums text-ink">
                          {formatPrecip(daily.precipitation_sum[d] ?? 0, units.temp)}
                        </dd>
                      </div>
                    </dl>

                    {miniData.length > 0 && (
                      <>
                        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                          {miniData.map((p, i) => {
                            const idx = hourIdxs[i];
                            const hIsDay = hourly.is_day[idx] === 1;
                            const h = describeCode(hourly.weather_code[idx], hIsDay);
                            return (
                              <div
                                key={hourly.time[idx]}
                                className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl bg-surface px-1 py-2.5"
                              >
                                <span className="text-[10px] font-bold uppercase text-mute">
                                  {p.time}
                                </span>
                                <h.Icon className={`h-4.5 w-4.5 ${kindTint[h.kind]}`} aria-hidden="true" />
                                <span className="text-xs font-bold tabular-nums text-ink">
                                  {formatTemp(hourly.temperature_2m[idx], units.temp)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-3 h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={miniData} margin={{ top: 6, right: 6, bottom: 0, left: 6 }}>
                              <defs>
                                <linearGradient id={`weekfill-${d}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                                minTickGap={42}
                                tick={{ fontSize: 10, fill: "var(--mute)" }}
                              />
                              <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                              <Tooltip content={<MiniTip />} cursor={{ stroke: "var(--edge)" }} />
                              <Area
                                type="monotone"
                                dataKey="temp"
                                stroke="var(--accent)"
                                strokeWidth={2}
                                fill={`url(#weekfill-${d})`}
                                animationDuration={500}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
