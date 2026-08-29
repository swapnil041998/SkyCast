import { ClipboardList, Footprints, Shirt, Umbrella } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Units, WeatherBundle } from "../types/weather";
import { describeCode } from "../utils/weatherCodes";
import { formatPrecip, formatTempUnit, formatWind } from "../utils/units";

interface Props {
  data: WeatherBundle;
  units: Units;
}

interface Tip {
  icon: LucideIcon;
  title: string;
  verdict: string;
  detail: string;
}

function buildTips(data: WeatherBundle, units: Units): Tip[] {
  const { current, daily } = data;
  const prob = Math.round(daily.precipitation_probability_max[0] ?? 0);
  const sum = daily.precipitation_sum[0] ?? 0;
  const windMax = daily.wind_speed_10m_max[0];
  const high = daily.temperature_2m_max[0];
  const feels = current.apparent_temperature;
  const { label, kind } = describeCode(current.weather_code, current.is_day === 1);

  const umbrella: Tip =
    prob >= 60 || sum >= 4
      ? {
          icon: Umbrella,
          title: "Umbrella",
          verdict: "Take it with you",
          detail: `A ${prob}% chance of rain and around ${formatPrecip(sum, units.temp)} expected today.`,
        }
      : prob >= 25
        ? {
            icon: Umbrella,
            title: "Umbrella",
            verdict: "Probably useful",
            detail: `${prob}% chance of a shower — a compact umbrella is a smart move.`,
          }
        : {
            icon: Umbrella,
            title: "Umbrella",
            verdict: "Leave it at home",
            detail: `Only a ${prob}% chance of rain on today's outlook.`,
          };

  const clothingVerdict =
    feels <= -5 ? "Bundle up in winter layers" :
    feels <= 5 ? "Heavy coat weather" :
    feels <= 12 ? "Warm jacket recommended" :
    feels <= 17 ? "Light jacket recommended" :
    feels <= 24 ? "Comfortable in light layers" :
    "Light, breathable clothing";

  const clothing: Tip = {
    icon: Shirt,
    title: "Clothing",
    verdict: clothingVerdict,
    detail: `Feels like ${formatTempUnit(feels, units.temp)} now, reaching ${formatTempUnit(high, units.temp)} today.`,
  };

  const outdoorVerdict: { verdict: string; detail: string } =
    kind === "thunder" || prob >= 60 || windMax >= 45
      ? {
          verdict: "Better indoors",
          detail: `${label} and ${formatWind(windMax, units.wind)} gusts — a cosy day inside sounds right.`,
        }
      : prob >= 30 || windMax >= 28 || kind === "rain" || kind === "drizzle"
        ? {
            verdict: "Fine with a backup plan",
            detail: `${label} with ${formatWind(windMax, units.wind)} winds — packable, but stay flexible.`,
          }
        : {
            verdict: "Good conditions for a walk",
            detail: `${label}, a high of ${formatTempUnit(high, units.temp)} and ${formatWind(windMax, units.wind)} winds.`,
          };

  const outdoor: Tip = { icon: Footprints, title: "Outdoor activity", ...outdoorVerdict };

  return [umbrella, clothing, outdoor];
}

/** Simple, data-driven suggestions — no safety-critical claims. */
export function PlanYourDay({ data, units }: Props) {
  const tips = buildTips(data, units);

  return (
    <section
      aria-labelledby="plan-title"
      className="rise rounded-3xl border border-edge bg-surface p-6 shadow-sm transition-colors duration-300"
    >
      <h3
        id="plan-title"
        className="font-display flex items-center gap-2 text-lg font-bold text-ink"
      >
        <ClipboardList className="h-5 w-5 text-accent" aria-hidden="true" />
        Plan your day
      </h3>

      <ul className="mt-4 divide-y divide-edge">
        {tips.map((tip) => (
          <li key={tip.title} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-raise text-accent">
              <tip.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-mute">
                {tip.title}
              </p>
              <p className="text-sm font-bold text-ink">{tip.verdict}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-mute">
                {tip.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-edge pt-3 text-[11px] leading-snug text-mute/80">
        Suggestions are generated from the live forecast — general guidance
        only.
      </p>
    </section>
  );
}
