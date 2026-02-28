export interface SensorData {
  t: number;       // Normal temperature (°C)
  l: number;       // Light level (0–255)
  c: number;       // Compass heading (0–360°)
  s: number;       // Sound level
  storm: number;   // Storm risk (0 = low, 1 = high)
  ultra: number;   // Ultra-precise averaged temperature (°C)
}

export type ConnectionMethod = 'bluetooth' | 'serial' | null;

export interface ConnectionState {
  connected: boolean;
  method: ConnectionMethod;
  error: string | null;
  dataRate: number; // packets per second
}

export interface HistoryPoint {
  timestamp: number;
  value: number;
}
