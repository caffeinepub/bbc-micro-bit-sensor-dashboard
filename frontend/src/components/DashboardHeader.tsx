import React from 'react';
import { Activity } from 'lucide-react';

interface DashboardHeaderProps {
  connected: boolean;
  lastUpdate: number | null;
}

export function DashboardHeader({ connected, lastUpdate }: DashboardHeaderProps) {
  const timeAgo = lastUpdate
    ? Math.round((Date.now() - lastUpdate) / 1000)
    : null;

  return (
    <header className="glass-panel px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          <img
            src="/assets/generated/microbit-logo.dim_128x128.png"
            alt="micro:bit logo"
            className="w-10 h-10 rounded-lg object-cover"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,220,240,0.6))' }}
          />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold glow-cyan leading-tight">
            micro:bit Dashboard
          </h1>
          <p className="text-xs text-white/40 font-mono leading-tight">
            BBC Sensor Monitor v1.0
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {lastUpdate && timeAgo !== null && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-white/40">
            <Activity className="w-3.5 h-3.5" />
            <span>
              {timeAgo === 0 ? 'just now' : `${timeAgo}s ago`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              connected ? 'status-dot-connected' : 'status-dot-disconnected'
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              connected ? 'text-dash-green' : 'text-white/40'
            }`}
          >
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </header>
  );
}
