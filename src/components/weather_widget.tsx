"use client";

import { useState, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudIcon, MapPinIcon, ThermometerIcon } from "lucide-react";

interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  unit: string;
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedLocation = location.trim();
    if (trimmedLocation === "") {
      setError("Please Enter a Valid Location.");
      setWeather(null);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`
      );
      if (!response.ok) {
        throw new Error("City not found.");
      }
      const data = await response.json();
      const weatherData: WeatherData = {
        temperature: data.current.temp_c,
        description: data.current.condition.text,
        location: data.location.name,
        unit: "C",
      };
      setWeather(weatherData);
    } catch (error) {
      setError("City not found. Could not fetch weather data. Try again.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  function getTemperatureMessage(temperature: number, unit: string): string {
    if (unit === "C") {
      if (temperature < 0) {
        return `It's freezing cold at ${temperature}°C! Bundle up!`;
      } else if (temperature < 10) {
        return `It's cold at ${temperature}°C. Wear a jacket!`;
      } else if (temperature < 20) {
        return `It's cool at ${temperature}°C. Enjoy the weather!`;
      } else if (temperature < 30) {
        return `It's warm at ${temperature}°C. Have fun!`;
      } else {
        return `It's hot at ${temperature}°C. Stay hydrated!`;
      }
    } else {
      return `${temperature}°${unit}`;
    }
  }

  function getWeatherData(description: string): string {
    switch (description.toLowerCase()) {
      case "sunny":
        return "It's an awesome sunny day!";
      case "clear":
        return "Clear";
      case "partly cloudy":
        return "Partly Cloudy";
      case "cloudy":
        return "Cloudy";
      default:
        return description;
    }
  }

  function getLocationMessage(location: string): string {
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 6;
    return `${location} ${isNight ? "at Night" : "during the Day"}`;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <Card className="w-full max-w-md mx-auto text-center bg-white shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Weather Widget
          </CardTitle>
          <CardDescription className="text-gray-600">
            Search for the current weather condition in your city.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 mb-4"
          >
            <Input
              type="text"
              placeholder="Enter City Name"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400 flex-grow"
            />
            <Button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-400"
            >
              {loading ? "Loading..." : "Search"}
            </Button>
          </form>
          {error && (
            <div className="mt-4 text-red-500 font-medium">{error}</div>
          )}
          {weather && (
            <>
              <div className="mt-4 grid gap-4">
                <div className="flex items-center gap-2">
                  <ThermometerIcon className="w-6 h-6 text-indigo-600" />
                  <span className="text-gray-800 font-semibold">
                    {getTemperatureMessage(weather.temperature, weather.unit)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudIcon className="w-6 h-6 text-indigo-600" />
                  <span className="text-gray-800 font-semibold">
                    {getWeatherData(weather.description)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-6 h-6 text-indigo-600" />
                  <span className="text-gray-800 font-semibold">
                    {getLocationMessage(weather.location)}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
