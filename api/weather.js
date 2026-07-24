const cities = {
  madrid: { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  london: { name: 'Londres', lat: 51.5074, lon: -0.1278 },
  paris: { name: 'París', lat: 48.8566, lon: 2.3522 },
  mexico: { name: 'Ciudad de México', lat: 19.4326, lon: -99.1332 },
  quito: { name: 'Quito', lat: -0.1807, lon: -78.4678 }
};

module.exports = async (req, res) => {
  const cityKey = String(req.query.city || '').toLowerCase();
  const city = cities[cityKey];

  if (!city) {
    return res.status(400).json({ error: 'Ciudad no soportada. Prueba madrid, london, paris, mexico o quito.' });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=celsius&timezone=auto`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.current_weather || !data.daily) {
      return res.status(502).json({ error: 'No se pudo obtener el clima del servicio externo.' });
    }

    return res.status(200).json({
      city: city.name,
      weather: data.current_weather,
      forecast: {
        dates: data.daily.time,
        weathercode: data.daily.weathercode,
        max: data.daily.temperature_2m_max,
        min: data.daily.temperature_2m_min
      },
      info: 'Datos obtenidos desde Open-Meteo'
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return res.status(500).json({ error: 'Error interno al obtener el clima.' });
  }
};
