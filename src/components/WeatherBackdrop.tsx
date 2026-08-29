import { useMemo } from "react";
import { backdropClass, type SkyKind } from "../utils/weatherCodes";

interface Props {
  kind: SkyKind;
  isDay: boolean;
}

interface Particle {
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function makeParticles(count: number, sizeMin: number, sizeMax: number): Particle[] {
  return Array.from({ length: count }, () => ({
    left: rand(0, 100),
    size: rand(sizeMin, sizeMax),
    duration: rand(6, 14),
    delay: rand(-14, 0),
    opacity: rand(0.35, 0.9),
  }));
}

/**
 * Purely decorative, animated atmosphere for the hero card — driven by the
 * real sky family and day/night flag. Hidden from assistive technology.
 */
export function WeatherBackdrop({ kind, isDay }: Props) {
  const flakes = useMemo(
    () => (kind === "snow" || kind === "sleet" ? makeParticles(kind === "snow" ? 28 : 10, 3, 6) : []),
    [kind]
  );
  const stars = useMemo(
    () => (!isDay && (kind === "clear" || kind === "partly") ? makeParticles(34, 1, 2.4) : []),
    [kind, isDay]
  );

  const showSun = isDay && (kind === "clear" || kind === "partly");
  const showMoon = !isDay && kind === "clear";
  const showRain = kind === "rain" || kind === "drizzle" || kind === "sleet" || kind === "thunder";
  const showClouds = kind === "cloudy" || kind === "partly" || kind === "fog" || kind === "rain" || kind === "thunder";
  const showFog = kind === "fog";
  const showFlash = kind === "thunder";

  return (
    <div className="wb fade-in" aria-hidden="true">
      <div className={`wb-base ${backdropClass(kind, isDay)}`} />

      {showSun && <div className="wb-sun" />}
      {showMoon && <div className="wb-moon" />}

      {stars.map((s, i) => (
        <span
          key={`star-${i}`}
          className="wb-star"
          style={{
            left: `${s.left}%`,
            top: `${rand(4, 55)}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration / 3}s`,
            animationDelay: `${s.delay}s`,
            opacity: s.opacity,
          }}
        />
      ))}

      {showClouds && (
        <>
          <div className="wb-cloud" style={{ top: "12%", left: "-4%", width: 240, height: 64, animationDuration: "26s" }} />
          <div className="wb-cloud" style={{ top: "38%", left: "30%", width: 300, height: 74, animationDuration: "34s", animationDelay: "-8s" }} />
          <div className="wb-cloud" style={{ top: "66%", left: "6%", width: 210, height: 56, animationDuration: "30s", animationDelay: "-15s" }} />
          <div className="wb-cloud" style={{ top: "24%", left: "58%", width: 260, height: 66, animationDuration: "38s", animationDelay: "-4s" }} />
        </>
      )}

      {showFog && (
        <>
          <div className="wb-fogband" style={{ top: "30%", left: "-10%", width: "80%", height: 46, animationDuration: "16s" }} />
          <div className="wb-fogband" style={{ top: "52%", left: "20%", width: "90%", height: 56, animationDuration: "22s", animationDelay: "-6s" }} />
          <div className="wb-fogband" style={{ top: "74%", left: "-6%", width: "70%", height: 42, animationDuration: "19s", animationDelay: "-11s" }} />
        </>
      )}

      {showRain && (
        <>
          <div className={`wb-rainlayer ${kind === "drizzle" ? "slow" : ""}`} />
          {kind !== "drizzle" && <div className="wb-rainlayer slow" />}
        </>
      )}

      {flakes.map((f, i) => (
        <span
          key={`flake-${i}`}
          className="wb-flake"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}

      {showFlash && <div className="wb-flash" />}

      {/* readability scrim */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(6,20,32,0.42)] via-[rgba(6,20,32,0.18)] to-transparent" />
    </div>
  );
}
