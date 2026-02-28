import React, { useEffect, useRef, useState } from 'react';
import { Navigation } from 'lucide-react';

interface CompassPanelProps {
  heading: number;
  hasData: boolean;
}

function getCardinalDirection(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx];
}

export function CompassPanel({ heading, hasData }: CompassPanelProps) {
  const prevHeadingRef = useRef(heading);
  const [displayRotation, setDisplayRotation] = useState(heading);

  useEffect(() => {
    if (!hasData) return;

    const prev = prevHeadingRef.current;
    let delta = heading - prev;

    // Shortest path
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const newRotation = displayRotation + delta;
    setDisplayRotation(newRotation);
    prevHeadingRef.current = heading;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heading, hasData]);

  const cardinal = getCardinalDirection(heading);

  return (
    <div className="glass-panel p-5 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4 w-full">
        <Navigation className="w-4 h-4 text-dash-cyan" />
        <span className="panel-label">Compass</span>
        <span className="ml-auto font-mono text-xs text-dash-cyan font-semibold">
          {hasData ? cardinal : '--'}
        </span>
      </div>

      {/* Compass SVG */}
      <div className="relative w-40 h-40 sm:w-44 sm:h-44">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full compass-ring"
          style={{ filter: 'drop-shadow(0 0 10px rgba(0,220,240,0.4))' }}
        >
          {/* Outer ring */}
          <circle
            cx="100" cy="100" r="95"
            fill="none"
            stroke="rgba(0,220,240,0.2)"
            strokeWidth="1"
          />
          {/* Inner ring */}
          <circle
            cx="100" cy="100" r="85"
            fill="rgba(0,20,50,0.6)"
            stroke="rgba(0,220,240,0.15)"
            strokeWidth="1"
          />

          {/* Degree ticks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i * 10 * Math.PI) / 180;
            const isMajor = i % 9 === 0;
            const r1 = isMajor ? 78 : 82;
            const r2 = 85;
            const x1 = 100 + r1 * Math.sin(angle);
            const y1 = 100 - r1 * Math.cos(angle);
            const x2 = 100 + r2 * Math.sin(angle);
            const y2 = 100 - r2 * Math.cos(angle);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isMajor ? 'rgba(0,220,240,0.5)' : 'rgba(0,220,240,0.2)'}
                strokeWidth={isMajor ? 1.5 : 0.8}
              />
            );
          })}

          {/* Cardinal labels */}
          {[
            { label: 'N', x: 100, y: 18, color: '#ff6464' },
            { label: 'S', x: 100, y: 188, color: 'rgba(0,220,240,0.8)' },
            { label: 'E', x: 186, y: 104, color: 'rgba(0,220,240,0.8)' },
            { label: 'W', x: 14, y: 104, color: 'rgba(0,220,240,0.8)' },
          ].map(({ label, x, y, color }) => (
            <text
              key={label}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={color}
              fontSize="13"
              fontFamily="Orbitron, monospace"
              fontWeight="700"
            >
              {label}
            </text>
          ))}

          {/* Needle group - rotates */}
          <g
            transform={`rotate(${displayRotation}, 100, 100)`}
            style={{ transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {/* North needle (red) */}
            <polygon
              points="100,30 96,100 100,95 104,100"
              fill="#ff6464"
              opacity="0.9"
              style={{ filter: 'drop-shadow(0 0 4px rgba(255,100,100,0.8))' }}
            />
            {/* South needle (cyan) */}
            <polygon
              points="100,170 96,100 100,105 104,100"
              fill="rgba(0,220,240,0.7)"
              style={{ filter: 'drop-shadow(0 0 4px rgba(0,220,240,0.6))' }}
            />
            {/* Center dot */}
            <circle cx="100" cy="100" r="5" fill="rgba(0,220,240,0.9)" />
            <circle cx="100" cy="100" r="2.5" fill="white" />
          </g>
        </svg>
      </div>

      {/* Heading display */}
      <div className="mt-3 text-center">
        <div
          className="sensor-value text-3xl"
          style={{ color: '#00dcf0' }}
        >
          {hasData ? `${Math.round(heading)}°` : '--°'}
        </div>
        <div className="panel-label mt-1">Heading</div>
      </div>
    </div>
  );
}
