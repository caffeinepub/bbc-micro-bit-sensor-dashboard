import { useCallback, useRef, useState } from 'react';
import { SensorData, HistoryPoint } from '../types/sensor';

const MAX_HISTORY = 300; // 5 minutes at 1Hz

export interface SensorHistory {
  temperature: HistoryPoint[];
  light: HistoryPoint[];
  sound: HistoryPoint[];
}

export function useSensorHistory() {
  const [history, setHistory] = useState<SensorHistory>({
    temperature: [],
    light: [],
    sound: [],
  });

  const historyRef = useRef<SensorHistory>({
    temperature: [],
    light: [],
    sound: [],
  });

  const addDataPoint = useCallback((data: SensorData) => {
    const now = Date.now();

    const addPoint = (arr: HistoryPoint[], value: number): HistoryPoint[] => {
      const next = [...arr, { timestamp: now, value }];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    };

    const newHistory: SensorHistory = {
      temperature: addPoint(historyRef.current.temperature, data.t),
      light: addPoint(historyRef.current.light, data.l),
      sound: addPoint(historyRef.current.sound, data.s),
    };

    historyRef.current = newHistory;
    setHistory(newHistory);
  }, []);

  const clearHistory = useCallback(() => {
    const empty: SensorHistory = { temperature: [], light: [], sound: [] };
    historyRef.current = empty;
    setHistory(empty);
  }, []);

  return { history, addDataPoint, clearHistory };
}
