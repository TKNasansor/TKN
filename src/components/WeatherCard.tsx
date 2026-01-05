import React from 'react';
import { Sun, Cloud, Wind, Droplet } from 'lucide-react';

type WeatherCardProps = {
  location: string;
  temperature: number;
  windspeed: number;
  weatherCode: number;
};

function weatherCodeToText(code: number) {
  // simplified mapping from Open-Meteo weathercode
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    95: 'Thunderstorm',
  };
  return map[code] ?? 'Unknown';
}

export default function WeatherCard({ location, temperature, windspeed, weatherCode }: WeatherCardProps) {
  const text = weatherCodeToText(weatherCode);

  return (
    <div className="max-w-xl mx-auto bg-white/80 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{location}</h2>
          <p className="text-sm text-gray-500">{text}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{Math.round(temperature)}°C</div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Wind className="w-4 h-4" /> {Math.round(windspeed)} km/h
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-500" /> <span className="text-sm">Temp</span>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-gray-400" /> <span className="text-sm">Sky</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-400" /> <span className="text-sm">Precip</span>
        </div>
      </div>
    </div>
  );
}
