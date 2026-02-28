import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SensorHistory } from '../hooks/useSensorHistory';

interface HistoryGraphsPanelProps {
  history: SensorHistory;
}

interface GraphConfig {
  key: keyof SensorHistory;
  label: string;
  color: string;
  domain: [number, number];
  unit: string;
}

const GRAPHS: GraphConfig[] = [
  { key: 'temperature', label: 'Temperature', color: '#00dcf0', domain: [-10, 50], unit: '°C' },
  { key: 'light', label: 'Light Level', color: '#ffcc00', domain: [0, 255], unit: '' },
  { key: 'sound', label: 'Sound Level', color: '#aa88ff', domain: [0, 255], unit: '' },
];

function formatTime(timestamp: number): string {
  const now = Date.now();
  const ago = Math.round((now - timestamp) / 1000);
  if (ago < 60) return `-${ago}s`;
  return `-${Math.round(ago / 60)}m`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; color: string }>;
  label?: string;
  unit: string;
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-3 py-2 text-xs font-mono">
      <div className="text-white/50 mb-1">{label}</div>
      <div style={{ color: payload[0].color }}>
        {payload[0].value.toFixed(1)}{unit}
      </div>
    </div>
  );
}

function MiniGraph({ config, data }: { config: GraphConfig; data: SensorHistory[keyof SensorHistory] }) {
  const chartData = useMemo(() => {
    // Sample every N points if too many for performance
    const step = Math.max(1, Math.floor(data.length / 60));
    return data
      .filter((_, i) => i % step === 0)
      .map((point) => ({
        time: formatTime(point.timestamp),
        value: point.value,
      }));
  }, [data]);

  const hasData = chartData.length > 0;

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: config.color, boxShadow: `0 0 6px ${config.color}` }}
        />
        <span className="panel-label">{config.label}</span>
        {hasData && (
          <span className="ml-auto text-xs font-mono" style={{ color: config.color }}>
            {chartData[chartData.length - 1]?.value.toFixed(1)}{config.unit}
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="h-24 flex items-center justify-center text-white/20 text-xs font-mono">
          Awaiting data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={96}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,220,0.06)" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'rgba(0,200,220,0.4)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={config.domain}
              tick={{ fill: 'rgba(0,200,220,0.4)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              content={<CustomTooltip unit={config.unit} />}
              cursor={{ stroke: 'rgba(0,220,240,0.2)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: config.color, stroke: 'none' }}
              style={{ filter: `drop-shadow(0 0 3px ${config.color}80)` }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function HistoryGraphsPanel({ history }: HistoryGraphsPanelProps) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-dash-cyan" />
        <h2 className="panel-label">History — Last 5 Minutes</h2>
        <span className="ml-auto text-xs font-mono text-white/30">
          {history.temperature.length} pts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {GRAPHS.map((config) => (
          <MiniGraph
            key={config.key}
            config={config}
            data={history[config.key]}
          />
        ))}
      </div>
    </div>
  );
}
