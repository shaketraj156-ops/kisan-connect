import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, Wind, Droplets, ThermometerSun, AlertCircle } from 'lucide-react';

const API_KEY = '3702d85e96009bbc3e82425c15a2dba3';

export default function WeatherWidget({ location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`);
        
        if (!res.ok) {
          throw new Error('API Error or Key not active yet');
        }

        const data = await res.json();
        
        // Map OpenWeather data to our UI format
        const temp = Math.round(data.main.temp);
        const humidity = data.main.humidity;
        const wind = Math.round(data.wind.speed * 3.6); // convert m/s to km/h
        const mainCondition = data.weather[0].main; // e.g. Rain, Clouds, Clear
        
        let condition = 'Sunny & Clear';
        let advice = "Clear weather window for the next few days. Good time to harvest and transport.";
        
        if (mainCondition === 'Rain' || mainCondition === 'Drizzle' || mainCondition === 'Thunderstorm') {
          condition = 'Rainy';
          advice = "Heavy rain expected. Ensure harvested crops are covered securely and avoid spraying pesticides.";
        } else if (mainCondition === 'Clouds') {
          condition = 'Partly Cloudy';
          advice = "Cloudy weather. Normal farming activities can continue.";
        }

        setWeather({
          temp,
          humidity,
          wind,
          condition,
          advice,
          isReal: true,
          cityName: data.name
        });

      } catch (err) {
        console.error('Weather API failed, falling back to simulation:', err);
        // Fallback to simulation if key is inactive (takes 10-15 mins) or city not found
        const seed = location ? location.length : 5;
        const isRainy = seed % 3 === 0;
        const isCloudy = seed % 2 === 0;

        setWeather({
          temp: 24 + (seed % 12),
          condition: isRainy ? 'Rainy' : isCloudy ? 'Partly Cloudy' : 'Sunny & Clear',
          humidity: 40 + (seed * 5 % 40),
          wind: 10 + (seed % 15),
          advice: isRainy 
            ? "Heavy rain expected. Ensure harvested crops are covered securely." 
            : "Clear weather window. Good time to harvest.",
          isReal: false,
          cityName: location
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  if (loading) {
    return (
      <div style={{...styles.card, justifyContent: 'center', alignItems: 'center', height: '200px'}} className="glass-panel">
        <span style={{ color: 'var(--text-secondary)' }}>Loading Live Weather...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div style={styles.card} className="glass-panel">
      <div style={styles.header}>
        <div style={styles.locationWrap}>
          <span style={styles.title}>
            {weather.isReal ? 'Live Satellite Forecast' : 'Simulated Forecast (API Key Activating)'}
          </span>
          <span style={styles.location}>{weather.cityName} Region</span>
        </div>
        <div style={styles.iconWrap}>
          {weather.condition === 'Rainy' ? <CloudRain size={28} color="#60a5fa" /> : 
           weather.condition === 'Partly Cloudy' ? <Cloud size={28} color="#94a3b8" /> : 
           <Sun size={28} color="#fbbf24" />}
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.tempCol}>
          <h2 style={styles.temperature}>{weather.temp}°C</h2>
          <span style={styles.conditionText}>{weather.condition}</span>
        </div>
        
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <Droplets size={14} color="var(--primary-light)" />
            <div>
              <div style={styles.statLabel}>Humidity</div>
              <div style={styles.statVal}>{weather.humidity}%</div>
            </div>
          </div>
          <div style={styles.statBox}>
            <Wind size={14} color="var(--primary-light)" />
            <div>
              <div style={styles.statLabel}>Wind Speed</div>
              <div style={styles.statVal}>{weather.wind} km/h</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.adviceBox}>
        <ThermometerSun size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
        <span style={styles.adviceText}><strong>Smart Advice:</strong> {weather.advice}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    textAlign: 'left'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  locationWrap: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-muted)'
  },
  location: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff'
  },
  iconWrap: {
    background: 'rgba(255,255,255,0.05)',
    padding: '0.5rem',
    borderRadius: '12px'
  },
  mainGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.2)',
    padding: '1rem',
    borderRadius: '12px'
  },
  tempCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  temperature: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#fff',
    lineHeight: '1'
  },
  conditionText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem'
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)'
  },
  statVal: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff'
  },
  adviceBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    background: 'rgba(245, 158, 11, 0.05)',
    border: '1px solid rgba(245, 158, 11, 0.1)',
    padding: '0.75rem',
    borderRadius: '8px'
  },
  adviceText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  }
};
