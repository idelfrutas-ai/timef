import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const cities = {
  madrid: { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  london: { name: 'Londres', lat: 51.5074, lon: -0.1278 },
  paris: { name: 'París', lat: 48.8566, lon: 2.3522 },
  mexico: { name: 'Ciudad de México', lat: 19.4326, lon: -99.1332 },
  quito: { name: 'Quito', lat: -0.1807, lon: -78.4678 }
};

const fetchWeatherFromApi = async (cityKey) => {
  const city = cities[cityKey.toLowerCase()];
  if (!city) {
    return { error: 'Ciudad no soportada. Prueba madrid, london, paris, mexico o quito.' };
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=celsius&timezone=auto`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.current_weather || !data.daily) {
    return { error: 'No se pudo obtener el clima del servicio externo.' };
  }

  return {
    city: city.name,
    weather: data.current_weather,
    forecast: {
      dates: data.daily.time,
      weathercode: data.daily.weathercode,
      max: data.daily.temperature_2m_max,
      min: data.daily.temperature_2m_min
    },
    info: 'Datos obtenidos desde Open-Meteo'
  };
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-weather-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/weather')) {
            return next();
          }

          try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const city = url.searchParams.get('city') || '';
            const result = await fetchWeatherFromApi(city);

            res.setHeader('Content-Type', 'application/json');
            if (result.error) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: result.error }));
            } else {
              res.end(JSON.stringify(result));
            }
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Error interno al obtener el clima.' }));
          }
        });
      }
    }
  ],
  server: {
    host: '127.0.0.1',
    port: 5002
  }
});
