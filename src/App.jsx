import { useState } from 'react';

const cities = [
  { key: 'madrid', label: 'Madrid' },
  { key: 'london', label: 'Londres' },
  { key: 'paris', label: 'París' },
  { key: 'mexico', label: 'Ciudad de México' },
  { key: 'quito', label: 'Quito' }
];

const weatherIcons = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '❄️',
  67: '❄️',
  71: '❄️',
  73: '❄️',
  75: '❄️',
  77: '❄️',
  80: '🌧️',
  81: '🌧️',
  82: '⛈️',
  85: '❄️',
  86: '❄️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️'
};

function App() {
  const [city, setCity] = useState('madrid');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const response = await fetch(`/api/weather?city=${city}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error en la petición');
      } else {
        setWeather(data);
      }
    } catch (e) {
      setError('No se pudo conectar con la API');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (code) => weatherIcons[code] || '❓';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="app-container">
      <h1>OnePage Weather App</h1>
      <p>El backend está integrado en el mismo proyecto y la app usa `/api/weather`.</p>

      <div className="card">
        <label htmlFor="city">Ciudad:</label>
        <select
          id="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        >
          {cities.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        <button onClick={fetchWeather} disabled={loading}>
          {loading ? 'Cargando...' : 'Consultar clima'}
        </button>
      </div>
      <p className="note">Asegúrate de ejecutar esta app con `npm run dev` o `npm run preview` en `onepage`.</p>

      {error && <p className="error">{error}</p>}

      {weather && (
        <>
          <div className="weather-result">
            <div className="weather-header">
              <div>
                <h2>Clima en {weather.city}</h2>
                <p>{getIcon(weather.weather.weathercode)} {weather.weather.weathercode}</p>
              </div>
              <div className="current-temp">
                {Math.round(weather.weather.temperature)}°C
              </div>
            </div>
            <div className="weather-details">
              <p>Viento: {weather.weather.windspeed} km/h</p>
              <p>Dirección: {weather.weather.winddirection}°</p>
              <p>Hora: {new Date(weather.weather.time).toLocaleTimeString('es-ES')}</p>
            </div>
          </div>

          <div className="weekly-card">
            <h3>Pronóstico semanal</h3>
            <div className="weekly-list">
              {weather.forecast.dates.map((day, index) => (
                <div className="daily-card" key={day}>
                  <span className="daily-date">{formatDate(day)}</span>
                  <div className="daily-icon">{getIcon(weather.forecast.weathercode[index])}</div>
                  <div className="daily-temps">
                    <span>{Math.round(weather.forecast.max[index])}° /</span>
                    <span>{Math.round(weather.forecast.min[index])}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
