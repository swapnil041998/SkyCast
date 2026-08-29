import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartLine } from "lucide-react";
import type { Units, WeatherBundle } from "../types/weather";
import { convertTemp, currentHourIndex } from "../utils/units";

interface Props {
  data: WeatherBundle;
  units: Units;
}

interface Point {
  time: string;
  temp: number;
  feels: number;
  pop: number;
  tempLabel: string;
}

function ChartTip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Point }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-edge bg-surface px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-bold text-ink">{p.time}</p>
      <p className="mt-1 font-semibold tabular-nums text-accent">
        {Math.round(p.temp)}° temperature
      </p>
      <p className="font-semibold tabular-nums text-mute">
        {Math.round(p.feels)}° feels like
      </p>
      <p className="tabular-nums text-mute">{Math.round(p.pop)}% rain chance</p>
    </div>
  );
}

/** Smooth 24-hour temperature curve with value labels. */
export function TemperatureChart({ data, units }: Props) {
  const { hourly } = data;
  const start = currentHourIndex(hourly.time, data.current.time);
  const unitSuffix = units.temp === "c" ? "°" : "°";

  const points: Point[] = hourly.time.slice(start, start + 24).map((iso, i) => {
    const idx = start + i;
    const temp = convertTemp(hourly.temperature_2m[idx], units.temp);
    const h = parseInt(iso.slice(11, 13), 10);
    const suffix = h < 12 ? "AM" : "PM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return {
      time: i === 0 ? "Now" : `${hr} ${suffix}`,
      temp,
      feels: convertTemp(hourly.apparent_temperature[idx], units.temp),
      pop: hourly.precipitation_probability[idx] ?? 0,
      tempLabel: i % 3 === 0 ? `${Math.round(temp)}${unitSuffix}` : "",
    };
  });

  return (
    <section
      aria-label="Temperature chart for the next 24 hours"
      className="rise rounded-3xl border border-edge bg-surface p-5 shadow-sm transition-colors duration-300 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display flex items-center gap-2 text-lg font-bold text-ink">
          <ChartLine className="h-5 w-5 text-accent" aria-hidden="true" />
          Temperature · next 24h
        </h3>
        <div className="flex items-center gap-4 text-xs font-semibold text-mute">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 rounded-full bg-accent" aria-hidden="true" />
            Temperature
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full bg-mute" aria-hidden="true" />
            Feels like
          </span>
        </div>
      </div>

      <div className="h-60 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 24, right: 12, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--edge)" strokeDasharray="4 6" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              interval={2}
              tick={{ fontSize: 11, fill: "var(--mute)" }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fontSize: 11, fill: "var(--mute)" }}
              tickFormatter={(v: number) => `${Math.round(v)}°`}
              domain={[
                (dataMin: number) => Math.floor(dataMin - 1.5),
                (dataMax: number) => Math.ceil(dataMax + 2.5),
              ]}
            />
            <Tooltip content={<ChartTip />} cursor={{ stroke: "var(--edge)", strokeWidth: 1.5 }} />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="var(--accent)"
              strokeWidth={2.5}
              fill="url(#tempFill)"
              activeDot={{ r: 4.5, strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={700}
            >
              <LabelList
                dataKey="tempLabel"
                position="top"
                offset={10}
                style={{ fontSize: 11, fontWeight: 700, fill: "var(--mute)" }}
              />
            </Area>
            <Line
              type="monotone"
              dataKey="feels"
              stroke="var(--mute)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={true}
              animationDuration={700}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
