import React, { useState } from 'react';
import { Search } from 'lucide-react';
import WeatherCard from './components/WeatherCard';

type GeocodeResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export default function App() {
  const [query, setQuery] = useState('Istanbul');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [locationName, setLocationName] = useState<string>('');

  async function fetchWeatherFor(queryText: string) {
    try {
      setLoading(true);
      setError(null);
      setWeather(null);

      // 1) geocode using Nominatim (OpenStreetMap)
      // Note: Browsers disallow setting the User-Agent header. Use the email query param and limit instead.
      const geocodeRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&email=youremail@example.com&q=${encodeURIComponent(queryText)}`
      );
      const geocodeJson: GeocodeResult[] = await geocodeRes.json();
      if (!geocodeJson || geocodeJson.length === 0) {
        throw new Error('Location not found');
      }
      const first = geocodeJson[0];
      setLocationName(first.display_name);

      const lat = first.lat;
      const lon = first.lon;

      // 2) fetch current weather from Open-Meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh`
      );
      const weatherJson = await weatherRes.json();
      if (!weatherJson || !weatherJson.current_weather) {
        throw new Error('Weather data not available');
      }

      setWeather(weatherJson.current_weather);
    } catch (err: any) {
      setError(err.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    // initial fetch
    fetchWeatherFor(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Weather Dashboard</h1>
          <p className="text-gray-600">Search for a city and get the current weather (Open-Meteo)</p>
        </header>

        <div className="flex gap-2 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchWeatherFor(query); }}
            className="flex-1 rounded-lg border px-4 py-2 shadow-sm focus:outline-none"
            placeholder="Search city, e.g. London"
          />
          <button
            className="bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => fetchWeatherFor(query)}
            disabled={loading}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {loading && <div className="text-center py-8">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {weather && (
          <div>
            <WeatherCard
              location={locationName}
              temperature={weather.temperature}
              windspeed={weather.windspeed}
              weatherCode={weather.weathercode}
            />

            <div className="mt-6 text-sm text-gray-500">
              Data provided by <a className="underline" href="https://open-meteo.com">Open-Meteo</a> and <a className="underline" href="https://nominatim.org">Nominatim (OSM)</a>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
