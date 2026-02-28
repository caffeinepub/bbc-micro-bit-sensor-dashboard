import React from 'react';
import { Cloud } from 'lucide-react';
import { SensorData } from '../types/sensor';
import { inferWeather } from '../utils/weatherInference';

interface WeatherStatusPanelProps {
  sensorData: SensorData | null;
}

export function WeatherStatusPanel({ sensorData }: WeatherStatusPanelProps) {
  const condition = sensorData
    ? inferWeather(sensorData)
    : { label: 'No Data', icon: '🔭', color: '#00dcf0', description: 'Connect micro:bit to begin' };

  return (
    <div className="glass-panel p-5 flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-2 mb-4 w-full justify-center">
        <Cloud className="w-4 h-4 text-dash-cyan" />
        <span className="panel-label">Weather Status</span>
      </div>

      {/* Weather Icon */}
      <div className="weather-icon text-5xl mb-3" role="img" aria-label={condition.label}>
        {condition.icon}
      </div>

      {/* Status Label */}
      <div
        className="text-xl font-display font-bold mb-1 transition-all duration-700"
        style={{
          color: condition.color,
          textShadow: `0 0 20px ${condition.color}60`,
        }}
      >
        {condition.label}
      </div>

      {/* Description */}
      <div className="text-xs text-white/40 font-mono">{condition.description}</div>

      {/* Sensor summary */}
      {sensorData && (
        <div className="mt-4 grid grid-cols-3 gap-2 w-full">
          <div className="bg-white/5 rounded-lg p-1.5 text-center">
            <div className="text-xs text-white/30 font-mono">TEMP</div>
            <div className="text-xs font-semibold font-mono text-dash-cyan">{sensorData.t.toFixed(1)}°</div>
          </div>
          <div className="bg-white/5 rounded-lg p-1.5 text-center">
            <div className="text-xs text-white/30 font-mono">LIGHT</div>
            <div className="text-xs font-semibold font-mono text-dash-cyan">{sensorData.l}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-1.5 text-center">
            <div className="text-xs text-white/30 font-mono">SOUND</div>
            <div className="text-xs font-semibold font-mono text-dash-cyan">{sensorData.s}</div>
          </div>
        </div>
      )}
    </div>
  );
}
