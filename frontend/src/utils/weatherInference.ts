import { SensorData } from '../types/sensor';

export interface WeatherCondition {
  label: string;
  icon: string;
  color: string;
  description: string;
}

export function inferWeather(data: SensorData): WeatherCondition {
  const { t, l, storm } = data;

  if (storm === 1) {
    return {
      label: 'Magnetic Disturbance',
      icon: '⚡',
      color: '#ff6464',
      description: 'High magnetic field detected',
    };
  }

  if (t < 0) {
    return {
      label: 'Freezing',
      icon: '❄️',
      color: '#88ccff',
      description: 'Below freezing temperatures',
    };
  }

  if (t < 10 && l < 60) {
    return {
      label: 'Night Cold',
      icon: '🌙',
      color: '#8899ff',
      description: 'Cold and dark conditions',
    };
  }

  if (t >= 22 && l >= 180) {
    return {
      label: 'Sunny',
      icon: '☀️',
      color: '#ffcc00',
      description: 'Warm and bright conditions',
    };
  }

  if (t >= 18 && t < 22 && l >= 150) {
    return {
      label: 'Partly Cloudy',
      icon: '⛅',
      color: '#aaddff',
      description: 'Mild with some cloud cover',
    };
  }

  if (l < 100 && t >= 10) {
    return {
      label: 'Cloudy',
      icon: '☁️',
      color: '#99bbcc',
      description: 'Overcast conditions',
    };
  }

  if (t >= 10 && t < 22 && l >= 100) {
    return {
      label: 'Mild',
      icon: '🌤️',
      color: '#66ddaa',
      description: 'Comfortable mild conditions',
    };
  }

  if (t >= 10 && t < 18 && l < 100) {
    return {
      label: 'Overcast',
      icon: '🌧️',
      color: '#7799aa',
      description: 'Cool and overcast',
    };
  }

  return {
    label: 'Unknown',
    icon: '🔭',
    color: '#00dcf0',
    description: 'Analyzing conditions...',
  };
}
