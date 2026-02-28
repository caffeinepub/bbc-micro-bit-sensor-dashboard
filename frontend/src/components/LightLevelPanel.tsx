import React from 'react';
import { Sun } from 'lucide-react';

interface LightLevelPanelProps {
  lightLevel: number;
  hasData: boolean;
}

function getLightLabel(l: number): { label: string; color: string } {
  if (l <= 50) return { label: 'Dark', color: '#6688aa' };
  if (l <= 100) return { label: 'Dim', color: '#88aacc' };
  if (l <= 180) return { label: 'Normal', color: '#00dcf0' };
  return { label: 'Bright', color: '#ffcc00' };
}

export function LightLevelPanel({ lightLevel, hasData }: LightLevelPanelProps) {
  const pct = Math.max(0, Math.min(100, (lightLevel / 255) * 100));
  const { label, color } = getLightLabel(lightLevel);

  const barGradient = lightLevel <= 50
    ? 'linear-gradient(90deg, #334466, #6688aa)'
    : lightLevel <= 100
    ? 'linear-gradient(90deg, #334466, #88aacc)'
    : lightLevel <= 180
    ? 'linear-gradient(90deg, #006688, #00dcf0)'
    : 'linear-gradient(90deg, #886600, #ffcc00)';

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sun className="w-4 h-4 text-dash-cyan" />
        <span className="panel-label">Light Level</span>
        <span
          className="ml-auto text-xs font-semibold font-mono px-2 py-0.5 rounded-full"
          style={{ color, background: `${color}20`, border: `1px solid ${color}40` }}
        >
          {label}
        </span>
      </div>

      {/* Numeric Value */}
      <div className="flex items-end gap-2 mb-4">
        <span
          className="sensor-value text-4xl"
          style={{ color, textShadow: `0 0 20px ${color}60` }}
        >
          {hasData ? lightLevel : '--'}
        </span>
        <span className="text-white/30 text-sm font-mono mb-1">/ 255</span>
      </div>

      {/* Horizontal Bar */}
      <div className="glow-bar h-4 w-full mb-3">
        <div
          className="glow-bar-fill"
          style={{
            width: `${pct}%`,
            background: barGradient,
            boxShadow: `0 0 12px ${color}60, 0 0 24px ${color}30`,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between text-xs font-mono text-white/25">
        <span>Dark</span>
        <span>Dim</span>
        <span>Normal</span>
        <span>Bright</span>
      </div>

      {/* Tick marks */}
      <div className="flex justify-between mt-1 px-0">
        {[0, 50, 100, 180, 255].map((tick) => (
          <div
            key={tick}
            className="w-px h-1.5 rounded-full"
            style={{
              background: lightLevel >= tick ? color : 'rgba(255,255,255,0.15)',
              opacity: lightLevel >= tick ? 0.8 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
