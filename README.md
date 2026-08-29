# SkyCast
SkyCast — a modern weather dashboard built with React, TypeScript &amp; Tailwind. Live current conditions, hourly + 7-day forecasts, city search with autocomplete, favourites, unit and theme switching, and dynamic weather-reactive backdrops — all powered by the free Open-Meteo API with no API key required.
# ⛅ SkyCast

A polished, production-quality weather forecast web app. Search any city on
earth (or drop a pin with geolocation) and get live conditions, an hourly
timeline, a 24-hour temperature chart, and a full 7-day outlook — wrapped in
a backdrop that responds to the actual weather and time of day.

Built with **React + TypeScript + Tailwind CSS**, powered by the free
[Open-Meteo](https://open-meteo.com) API. No account, no API key, no
tracking — your favourites and preferences live in your browser.

![SkyCast preview](./preview.png)

## ✨ Features

- 🌍 **City search** with debounced autocomplete via the Open-Meteo
  Geocoding API (name, region, country) — keyboard navigable
- 📍 **Use my location** — geolocation with reverse geocoding and graceful
  permission-denied handling
- 🌡️ **Current conditions** — temperature, feels-like, humidity, wind speed
  & direction, precipitation, cloud cover, pressure, visibility
- ⏱️ **Hourly forecast** — scrollable 24-hour strip with rain probability,
  current hour highlighted
- 📈 **Temperature chart** — smooth 24h curve with feels-like overlay and
  value labels (Recharts)
- 📅 **7-day forecast** — expandable rows with per-day hourly breakdown,
  sunrise/sunset, wind, rain chance and temperature range bars
- 🧭 **Today's outlook** — a plain-language summary generated from the live
  data, plus "Plan your day" suggestions (umbrella, clothing, outdoor plans)
- ⭐ **Favourite cities** — save, remove and jump between cities
  (LocalStorage)
- 🌗 **Light / dark mode** — respects system preference on first visit,
  persisted afterwards
- 🎨 **Dynamic backdrop** — the hero and page tint shift with the real
  weather code: clear, cloudy, fog, rain, snow, thunderstorm, day or night
- 🔁 **°C/°F and km/h/mph toggles** — fully converted everywhere, persisted
- 📱 **Responsive** — spacious desktop dashboard, stacked mobile layout,
  no horizontal overflow
- ♿ **Accessible** — semantic HTML, ARIA combobox/listbox, visible focus
  states, reduced-motion support, live status announcements

## 🛠️ Tech stack

| Layer    | Tech                                    |
| -------- | --------------------------------------- |
| UI       | React 18, TypeScript, Tailwind CSS v4   |
| Icons    | Lucide React                            |
| Charts   | Recharts                                |
| Weather  | Open-Meteo Forecast + Geocoding APIs    |
| Tooling  | Vite                                    |

## 🚀 Getting started

```bash
git clone https://github.com/<you>/skycast.git
cd skycast
npm install
npm run dev

🏗️ Architecture
src/
├── components/     Header, SearchBar, CurrentWeather, WeatherBackdrop,
│                   WeatherSummary, PlanYourDay, HourlyForecast,
│                   TemperatureChart, WeeklyForecast, WeatherDetails,
│                   FavouriteCities, Controls, States
├── services/       weatherApi.ts        (all network calls + typed errors)
├── utils/          weatherCodes.ts      (WMO code → label/icon/sky mapping)
│                   units.ts             (temp/wind/precip/time conversion)
├── hooks/          useWeather (cached + abortable), useLocalStorage,
│                   useDebouncedValue
└── types/          weather.ts
