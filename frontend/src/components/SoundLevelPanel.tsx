import React from 'react';
import { Volume2 } from 'lucide-react';

interface SoundLevelPanelProps {
  soundLevel: number;
  hasData: boolean;
}

function getSoundLabel(s: number): { label: string; color: string } {
  if (s < 40) return { label: 'Quiet', color: '#66ddaa' };
  if (s < 120) return { label: 'Normal', color: '#00dcf0' };
  return { label: 'Loud', color: '#ff6464' };
}

export function SoundLevelPanel({ soundLevel, hasData }: SoundLevelPanelProps) {
  // Assume max sound ~255
  const pct = Math.max(0, Math.min(100, (soundLevel / 255) * 100));
  const { label, color } = getSoundLabel(soundLevel);

  const barGradient = soundLevel < 40
    ? 'linear-gradient(0deg, #224433, #66ddaa)'
    : soundLevel < 120
    ? 'linear-gradient(0deg, #006688, #00dcf0)'
    : 'linear-gradient(0deg, #882222, #ff6464)';

  // Generate bar segments for visual effect
  const segments = 12;

  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-4 h-4 text-dash-cyan" />
        <span className="panel-label">Sound Level</span>
        <span
          className="ml-auto text-xs font-semibold font-mono px-2 py-0.5 rounded-full"
          style={{ color, background: `${color}20`, border: `1px solid ${color}40` }}
        >
          {label}
        </span>
      </div>

      <div className="flex gap-4 flex-1 items-end">
        {/* Vertical Meter */}
        <div className="flex gap-1 items-end h-36">
          {Array.from({ length: segments }).map((_, i) => {
            const segPct = ((i + 1) / segments) * 100;
            const active = pct >= segPct - (100 / segments);
            const segColor = i < 5 ? '#66ddaa' : i < 9 ? '#00dcf0' : '#ff6464';
            return (
              <div
                key={i}
                className="w-3 rounded-sm"
                style={{
                  height: `${((i + 1) / segments) * 100}%`,
                  background: active ? segColor : 'rgba(255,255,255,0.06)',
                  boxShadow: active ? `0 0 6px ${segColor}80` : 'none',
                  transition: 'background 0.3s ease, box-shadow 0.3s ease',
                  minHeight: '4px',
                }}
              />
            );
          })}
        </div>

        {/* Value and labels */}
        <div className="flex flex-col justify-between h-36 flex-1">
          <div className="text-xs font-mono text-white/25">255</div>
          <div className="text-center">
            <div
              className="sensor-value text-3xl"
              style={{ color, textShadow: `0 0 20px ${color}60` }}
            >
              {hasData ? soundLevel : '--'}
            </div>
            <div className="panel-label mt-1">Level</div>
          </div>
          <div className="text-xs font-mono text-white/25">0</div>
        </div>
      </div>

      {/* Labels */}
      <div className="mt-3 flex justify-between text-xs font-mono text-white/30">
        <span>Quiet</span>
        <span>Normal</span>
        <span>Loud</span>
      </div>
    </div>
  );
}
