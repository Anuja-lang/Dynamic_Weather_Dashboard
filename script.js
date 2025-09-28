// Using Open-Meteo API (no API key required)
// Docs: https://open-meteo.com/en/docs

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locBtn = document.getElementById("loc-btn");

const cityNameEl = document.getElementById("city-name");
const weatherDescEl = document.getElementById("weather-desc");
const tempEl = document.getElementById("temp");
const extraEl = document.getElementById("extra");
const forecastEl = document.getElementById("forecast");
const iconEl = document.getElementById("weather-icon");

// Simple mapping of codes to icons
function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if ([1,2,3].includes(code)) return "⛅";
  if ([45,48].includes(code)) return "🌫️";
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return "🌧️";
  if ([71,73,75,77,85,86].includes(code)) return "❄️";
  if ([95,96,99].includes(code)) return "⛈️";
  return "☁️";
}

// Fetch by coordinates
async function fetchWeather(lat, lon, place="Your location") {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();

    renderWeather(data, place);
  } catch (err) {
    alert("Failed to fetch weather");
    console.error(err);
  }
}

// Render
function renderWeather(data, place) {
  const cur = data.current_weather;
  cityNameEl.textContent = place;
  weatherDescEl.textContent = `Windspeed ${cur.windspeed} km/h`;
  tempEl.textContent = `${Math.round(cur.temperature)}°C`;
  extraEl.textContent = `Feels like ${cur.temperature}°C • Wind ${cur.windspeed} km/h`;
  iconEl.innerHTML = `<span>${getWeatherIcon(cur.weathercode)}</span>`;

  // Forecast
  forecastEl.innerHTML = "";
  data.daily.time.forEach((date, i) => {
    if (i === 0) return; // skip today
    const div = document.createElement("div");
    div.className = "day";
    const label = new Date(date).toLocaleDateString(undefined,{weekday:"short"});
    div.innerHTML = `
      <div>${label}</div>
      <div style="font-size:32px">${getWeatherIcon(data.daily.weathercode[i])}</div>
      <div>${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</div>
    `;
    forecastEl.appendChild(div);
  });
}

// Events
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  // Use geocoding API (Nominatim free)
  const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
  const res = await fetch(geoUrl);
  const results = await res.json();
  if (!results.length) {
    alert("City not found");
    return;
  }
  const { lat, lon, display_name } = results[0];
  fetchWeather(lat, lon, display_name.split(",")[0]);
});

locBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
    err => alert("Location access denied")
  );
});

// Auto-load by location on start
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
    ()=>{}
  );
}
