import React, { useCallback, useEffect, useState } from 'react';
import { SensorData } from './types/sensor';
import { useBluetoothConnection } from './hooks/useBluetoothConnection';
import { useSerialConnection } from './hooks/useSerialConnection';
import { useSensorDataParser } from './hooks/useSensorDataParser';
import { useSensorHistory } from './hooks/useSensorHistory';

import { DashboardHeader } from './components/DashboardHeader';
import { BrowserCompatibilityNotice } from './components/BrowserCompatibilityNotice';
import { ATPAPanel } from './components/ATPAPanel';
import { TemperaturePanel } from './components/TemperaturePanel';
import { LightLevelPanel } from './components/LightLevelPanel';
import { CompassPanel } from './components/CompassPanel';
import { SoundLevelPanel } from './components/SoundLevelPanel';
import { StormDetectionPanel } from './components/StormDetectionPanel';
import { WeatherStatusPanel } from './components/WeatherStatusPanel';
import { HistoryGraphsPanel } from './components/HistoryGraphsPanel';

const DEFAULT_SENSOR: SensorData = {
  t: 0,
  l: 0,
  c: 0,
  s: 0,
  storm: 0,
  ultra: 0,
};

export default function App() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const { history, addDataPoint } = useSensorHistory();

  const handleSensorData = useCallback(
    (data: SensorData) => {
      setSensorData(data);
      setLastUpdate(Date.now());
      addDataPoint(data);
    },
    [addDataPoint]
  );

  const { pushChunk: pushChunkBLE, reset: resetBLE } = useSensorDataParser(handleSensorData);
  const { pushChunk: pushChunkSerial, reset: resetSerial } = useSensorDataParser(handleSensorData);

  const handleBLEData = useCallback(
    (chunk: string) => {
      pushChunkBLE(chunk);
    },
    [pushChunkBLE]
  );

  const handleSerialData = useCallback(
    (chunk: string) => {
      pushChunkSerial(chunk);
    },
    [pushChunkSerial]
  );

  const handleBLEDisconnect = useCallback(() => {
    resetBLE();
  }, [resetBLE]);

  const handleSerialDisconnect = useCallback(() => {
    resetSerial();
  }, [resetSerial]);

  const ble = useBluetoothConnection({
    onData: handleBLEData,
    onDisconnect: handleBLEDisconnect,
  });

  const serial = useSerialConnection({
    onData: handleSerialData,
    onDisconnect: handleSerialDisconnect,
  });

  const isConnected = ble.status === 'connected' || serial.status === 'connected';
  const displayData = sensorData ?? DEFAULT_SENSOR;
  const hasData = sensorData !== null;

  // Update last-update timestamp display every second
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background layers */}
      <div className="dashboard-bg" />
      <div className="gradient-overlay" />
      <div className="scan-line" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* Header */}
          <DashboardHeader connected={isConnected} lastUpdate={lastUpdate} />

          {/* Browser Compatibility Notice */}
          <BrowserCompatibilityNotice />

          {/* Top Row: ATPA + Weather + Storm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ATPAPanel
              bleStatus={ble.status}
              serialStatus={serial.status}
              bleError={ble.error}
              serialError={serial.error}
              blePackets={ble.packetsReceived}
              serialPackets={serial.packetsReceived}
              onConnectBluetooth={ble.connect}
              onDisconnectBluetooth={ble.disconnect}
              onConnectSerial={serial.connect}
              onDisconnectSerial={serial.disconnect}
            />
            <WeatherStatusPanel sensorData={sensorData} />
            <StormDetectionPanel stormRisk={displayData.storm} hasData={hasData} />
          </div>

          {/* Middle Row: Temperature (large) + Light + Compass + Sound */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Temperature takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <TemperaturePanel
                temperature={displayData.t}
                ultraTemperature={displayData.ultra}
                hasData={hasData}
              />
            </div>
            <LightLevelPanel lightLevel={displayData.l} hasData={hasData} />
            <div className="grid grid-rows-2 gap-4">
              <CompassPanel heading={displayData.c} hasData={hasData} />
              <SoundLevelPanel soundLevel={displayData.s} hasData={hasData} />
            </div>
          </div>

          {/* History Graphs */}
          <HistoryGraphsPanel history={history} />

          {/* Footer */}
          <footer className="text-center py-4 text-xs text-white/20 font-mono">
            <span>
              © {new Date().getFullYear()} BBC micro:bit Sensor Dashboard — Built with{' '}
              <span className="text-red-400">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'microbit-dashboard'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dash-cyan hover:text-white transition-colors"
              >
                caffeine.ai
              </a>
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
