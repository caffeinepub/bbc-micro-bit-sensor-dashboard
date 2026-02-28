import React, { useState } from 'react';
import { Bluetooth, Usb, Wifi, WifiOff, RefreshCw, AlertCircle, Signal } from 'lucide-react';
import { BLEConnectionStatus } from '../hooks/useBluetoothConnection';
import { SerialConnectionStatus } from '../hooks/useSerialConnection';

interface ConnectionPanelProps {
  bleStatus: BLEConnectionStatus;
  serialStatus: SerialConnectionStatus;
  bleError: string | null;
  serialError: string | null;
  blePackets: number;
  serialPackets: number;
  onConnectBluetooth: () => void;
  onDisconnectBluetooth: () => void;
  onConnectSerial: () => void;
  onDisconnectSerial: () => void;
}

export function ConnectionPanel({
  bleStatus,
  serialStatus,
  bleError,
  serialError,
  blePackets,
  serialPackets,
  onConnectBluetooth,
  onDisconnectBluetooth,
  onConnectSerial,
  onDisconnectSerial,
}: ConnectionPanelProps) {
  const isConnected = bleStatus === 'connected' || serialStatus === 'connected';
  const isConnecting = bleStatus === 'connecting' || serialStatus === 'connecting';
  const activeMethod = bleStatus === 'connected' ? 'bluetooth' : serialStatus === 'connected' ? 'serial' : null;
  const totalPackets = blePackets + serialPackets;
  const error = bleError || serialError;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Signal className="w-4 h-4 text-dash-cyan" />
        <h2 className="panel-label">Connection</h2>
        <div className="ml-auto flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'status-dot-connected' : 'status-dot-disconnected'
            }`}
          />
          <span
            className={`text-xs font-mono font-semibold ${
              isConnected ? 'text-dash-green' : 'text-white/40'
            }`}
          >
            {isConnected ? 'CONNECTED' : isConnecting ? 'CONNECTING...' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Bluetooth Button */}
        <div>
          {bleStatus === 'connected' ? (
            <button
              onClick={onDisconnectBluetooth}
              className="btn-glass btn-glass-danger w-full justify-center"
            >
              <Bluetooth className="w-4 h-4" />
              <span>Disconnect BLE</span>
            </button>
          ) : (
            <button
              onClick={onConnectBluetooth}
              disabled={bleStatus === 'connecting' || serialStatus === 'connected' || serialStatus === 'connecting'}
              className="btn-glass w-full justify-center"
            >
              {bleStatus === 'connecting' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Bluetooth className="w-4 h-4" />
              )}
              <span>{bleStatus === 'connecting' ? 'Connecting...' : 'Bluetooth'}</span>
            </button>
          )}
        </div>

        {/* USB Serial Button */}
        <div>
          {serialStatus === 'connected' ? (
            <button
              onClick={onDisconnectSerial}
              className="btn-glass btn-glass-danger w-full justify-center"
            >
              <Usb className="w-4 h-4" />
              <span>Disconnect USB</span>
            </button>
          ) : (
            <button
              onClick={onConnectSerial}
              disabled={serialStatus === 'connecting' || bleStatus === 'connected' || bleStatus === 'connecting'}
              className="btn-glass w-full justify-center"
            >
              {serialStatus === 'connecting' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Usb className="w-4 h-4" />
              )}
              <span>{serialStatus === 'connecting' ? 'Connecting...' : 'USB Serial'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Info */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-xs text-white/40 font-mono mb-0.5">METHOD</div>
          <div className="text-xs font-semibold text-dash-cyan font-mono">
            {activeMethod === 'bluetooth' ? 'BLE' : activeMethod === 'serial' ? 'USB' : '—'}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-xs text-white/40 font-mono mb-0.5">PACKETS</div>
          <div className="text-xs font-semibold text-dash-cyan font-mono">
            {totalPackets > 0 ? totalPackets.toLocaleString() : '—'}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-xs text-white/40 font-mono mb-0.5">STATUS</div>
          <div className="flex items-center justify-center">
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-dash-green" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-white/30" />
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
}
