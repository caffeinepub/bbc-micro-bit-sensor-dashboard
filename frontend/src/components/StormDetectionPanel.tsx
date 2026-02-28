import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

interface StormDetectionPanelProps {
  stormRisk: number;
  hasData: boolean;
}

export function StormDetectionPanel({ stormRisk, hasData }: StormDetectionPanelProps) {
  const isHigh = stormRisk === 1;

  return (
    <div
      className={`glass-panel p-5 flex flex-col items-center justify-center text-center ${
        hasData ? (isHigh ? 'storm-high' : 'storm-low') : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4 w-full justify-center">
        <Zap className="w-4 h-4 text-dash-cyan" />
        <span className="panel-label">Storm Detection</span>
      </div>

      {/* Main Indicator */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-700"
        style={{
          background: hasData
            ? isHigh
              ? 'radial-gradient(circle, rgba(255,60,60,0.25) 0%, rgba(255,60,60,0.05) 100%)'
              : 'radial-gradient(circle, rgba(0,220,120,0.25) 0%, rgba(0,220,120,0.05) 100%)'
            : 'radial-gradient(circle, rgba(100,100,150,0.15) 0%, transparent 100%)',
          border: hasData
            ? isHigh
              ? '2px solid rgba(255,60,60,0.5)'
              : '2px solid rgba(0,220,120,0.5)'
            : '2px solid rgba(100,100,150,0.2)',
          boxShadow: hasData
            ? isHigh
              ? '0 0 30px rgba(255,60,60,0.4), inset 0 0 20px rgba(255,60,60,0.1)'
              : '0 0 30px rgba(0,220,120,0.4), inset 0 0 20px rgba(0,220,120,0.1)'
            : 'none',
        }}
      >
        {isHigh ? (
          <Zap
            className="w-10 h-10"
            style={{ color: '#ff6464', filter: 'drop-shadow(0 0 8px rgba(255,100,100,0.8))' }}
          />
        ) : (
          <ShieldCheck
            className="w-10 h-10"
            style={{ color: '#00dc78', filter: 'drop-shadow(0 0 8px rgba(0,220,120,0.8))' }}
          />
        )}
      </div>

      {/* Status Text */}
      <div
        className="text-lg font-display font-bold transition-all duration-700"
        style={{
          color: !hasData ? 'rgba(150,150,180,0.5)' : isHigh ? '#ff6464' : '#00dc78',
          textShadow: !hasData
            ? 'none'
            : isHigh
            ? '0 0 15px rgba(255,100,100,0.7)'
            : '0 0 15px rgba(0,220,120,0.7)',
        }}
      >
        {!hasData ? 'No Data' : isHigh ? 'Storm Risk High' : 'Storm Risk Low'}
      </div>

      <div className="panel-label mt-2">
        {!hasData ? 'Awaiting data...' : isHigh ? 'Magnetic anomaly detected' : 'Conditions normal'}
      </div>
    </div>
  );
}
