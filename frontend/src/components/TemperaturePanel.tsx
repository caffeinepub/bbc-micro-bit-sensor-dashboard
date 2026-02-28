import React from 'react';
import { Thermometer } from 'lucide-react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

interface TemperaturePanelProps {
  temperature: number;
  ultraTemperature: number;
  hasData: boolean;
}

export function TemperaturePanel({ temperature, ultraTemperature, hasData }: TemperaturePanelProps) {
  const animatedTemp = useAnimatedNumber(temperature, 700);
  const animatedUltra = useAnimatedNumber(ultraTemperature, 700);

  const getTempColor = (t: number) => {
    if (t < 0) return '#88ccff';
    if (t < 10) return '#aaddff';
    if (t < 18) return '#66ddaa';
    if (t < 25) return '#00dcf0';
    if (t < 32) return '#ffcc00';
    return '#ff6464';
  };

  const tempColor = getTempColor(temperature);

  // Scale: -50°C (0%) to +110°C (100%), total range = 160°
  const MIN_TEMP = -50;
  const MAX_TEMP = 110;
  const RANGE = MAX_TEMP - MIN_TEMP; // 160

  return (
    <div className="glass-panel p-6 flex flex-col items-center justify-center text-center h-full">
      <div className="flex items-center gap-2 mb-4">
        <Thermometer className="w-4 h-4 text-dash-cyan" />
        <span className="panel-label">Temperature</span>
      </div>

      {/* Main Temperature */}
      <div className="mb-5">
        <div
          className="sensor-value-large text-6xl sm:text-7xl leading-none mb-1"
          style={{ color: tempColor, textShadow: `0 0 30px ${tempColor}80, 0 0 60px ${tempColor}30` }}
        >
          {hasData ? animatedTemp.toFixed(1) : '--.-'}
        </div>
        <div className="text-2xl font-display font-bold text-white/40">°C</div>
        <div className="panel-label mt-2">Normal Temperature</div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-dash-cyan/20 to-transparent mb-5" />

      {/* Ultra Precise Temperature */}
      <div>
        <div
          className="sensor-value text-3xl sm:text-4xl leading-none mb-1"
          style={{ color: tempColor, opacity: 0.85, textShadow: `0 0 20px ${tempColor}60` }}
        >
          {hasData ? animatedUltra.toFixed(2) : '--.-'}
        </div>
        <div className="text-lg font-display font-bold text-white/30">°C</div>
        <div className="panel-label mt-1.5">Ultra Precise</div>
      </div>

      {/* Temperature scale indicator */}
      <div className="mt-5 w-full">
        <div className="flex justify-between text-xs font-mono text-white/25 mb-1">
          <span>-50°</span>
          <span>0°</span>
          <span>50°</span>
          <span>110°</span>
        </div>
        <div className="glow-bar h-1.5 w-full">
          <div
            className="glow-bar-fill"
            style={{
              width: `${Math.max(0, Math.min(100, ((temperature - MIN_TEMP) / RANGE) * 100))}%`,
              background: `linear-gradient(90deg, #88ccff, ${tempColor})`,
              boxShadow: `0 0 8px ${tempColor}80`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
