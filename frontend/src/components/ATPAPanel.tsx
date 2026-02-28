import React, { useState, useRef } from 'react';
import { Lock, Unlock, ShieldAlert, MapPin, KeyRound, LogOut } from 'lucide-react';
import { ConnectionPanel } from './ConnectionPanel';
import { BLEConnectionStatus } from '../hooks/useBluetoothConnection';
import { SerialConnectionStatus } from '../hooks/useSerialConnection';

const ATPA_PASSWORD = '2AKFPMB0220';

interface ATPAPanelProps {
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

export function ATPAPanel({
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
}: ATPAPanelProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [accessError, setAccessError] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [deviceLocation, setDeviceLocation] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAccess(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === ATPA_PASSWORD) {
      setUnlocked(true);
      setAccessError(false);
      setPasswordInput('');
    } else {
      setAccessError(true);
      setPasswordInput('');
      inputRef.current?.focus();
    }
  }

  function handleLock() {
    setUnlocked(false);
    setPasswordInput('');
    setAccessError(false);
    setLocationInput('');
    setDeviceLocation('');
  }

  function handleSetLocation(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = locationInput.trim();
    if (trimmed) {
      setDeviceLocation(trimmed);
    }
  }

  return (
    <div
      className="glass-panel p-5 transition-all duration-500"
      style={{
        borderColor: unlocked
          ? 'rgba(0, 200, 220, 0.45)'
          : 'rgba(0, 200, 220, 0.18)',
        boxShadow: unlocked
          ? '0 8px 40px rgba(0,0,0,0.5), 0 0 28px rgba(0,200,220,0.18), 0 0 0 1px rgba(0,200,220,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'
          : undefined,
      }}
    >
      {/* Panel Header */}
      <div className="flex items-center gap-2 mb-4">
        {unlocked ? (
          <Unlock className="w-4 h-4 text-dash-cyan" />
        ) : (
          <Lock className="w-4 h-4 text-white/50" />
        )}
        <div>
          <h2 className="panel-label tracking-widest">ATPA</h2>
          <p
            className="text-white/40 font-mono"
            style={{ fontSize: '0.55rem', letterSpacing: '0.08em', marginTop: '1px' }}
          >
            Admin Transmission Ports Access
          </p>
        </div>
        {unlocked && (
          <button
            onClick={handleLock}
            className="ml-auto btn-glass btn-glass-danger flex items-center gap-1.5"
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        )}
      </div>

      {/* Divider */}
      <div
        className="mb-4"
        style={{
          height: '1px',
          background: unlocked
            ? 'linear-gradient(90deg, transparent, rgba(0,220,240,0.35), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        }}
      />

      {/* LOCKED STATE */}
      {!unlocked && (
        <div
          className="transition-all duration-400"
          style={{ animation: 'fadeInUp 0.35s ease' }}
        >
          <div className="flex flex-col items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: '3rem',
                height: '3rem',
                background: 'rgba(0,200,220,0.08)',
                border: '1px solid rgba(0,200,220,0.2)',
              }}
            >
              <KeyRound className="w-5 h-5 text-dash-cyan" style={{ opacity: 0.7 }} />
            </div>
            <p className="text-white/40 font-mono text-center" style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}>
              Enter access credentials to unlock transmission ports
            </p>
          </div>

          <form onSubmit={handleAccess} className="flex flex-col gap-3">
            <input
              ref={inputRef}
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setAccessError(false);
              }}
              placeholder="Access Code"
              autoComplete="off"
              className="w-full font-mono text-sm text-dash-cyan placeholder-white/20 outline-none"
              style={{
                background: 'rgba(0,200,220,0.07)',
                border: accessError
                  ? '1px solid rgba(220,60,60,0.55)'
                  : '1px solid rgba(0,200,220,0.25)',
                borderRadius: '0.75rem',
                padding: '0.6rem 1rem',
                letterSpacing: '0.12em',
                transition: 'border-color 0.25s ease',
              }}
            />

            {accessError && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{
                  background: 'rgba(220,60,60,0.1)',
                  border: '1px solid rgba(220,60,60,0.3)',
                  animation: 'fadeInUp 0.2s ease',
                }}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 font-mono" style={{ fontSize: '0.7rem' }}>
                  Access Denied – Invalid Credentials
                </span>
              </div>
            )}

            <button
              type="submit"
              className="btn-glass w-full justify-center"
              style={{ padding: '0.55rem 1rem' }}
            >
              <Lock className="w-4 h-4" />
              <span>Access</span>
            </button>
          </form>
        </div>
      )}

      {/* UNLOCKED STATE */}
      {unlocked && (
        <div
          className="flex flex-col gap-4 transition-all duration-400"
          style={{ animation: 'fadeInUp 0.35s ease' }}
        >
          {/* Unlocked badge */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{
              background: 'rgba(0,220,120,0.08)',
              border: '1px solid rgba(0,220,120,0.25)',
            }}
          >
            <Unlock className="w-3.5 h-3.5 text-dash-green flex-shrink-0" />
            <span className="text-dash-green font-mono" style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}>
              ATPA ACCESS GRANTED — Transmission Ports Active
            </span>
          </div>

          {/* Connection Panel (unchanged, embedded here) */}
          <ConnectionPanel
            bleStatus={bleStatus}
            serialStatus={serialStatus}
            bleError={bleError}
            serialError={serialError}
            blePackets={blePackets}
            serialPackets={serialPackets}
            onConnectBluetooth={onConnectBluetooth}
            onDisconnectBluetooth={onDisconnectBluetooth}
            onConnectSerial={onConnectSerial}
            onDisconnectSerial={onDisconnectSerial}
          />

          {/* Device Location Section */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'rgba(0,200,220,0.05)',
              border: '1px solid rgba(0,200,220,0.18)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-dash-cyan" style={{ opacity: 0.8 }} />
              <span className="panel-label">Device Location</span>
            </div>

            <form onSubmit={handleSetLocation} className="flex gap-2">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter micro:bit location (city or place)"
                className="flex-1 font-mono text-sm text-white/80 placeholder-white/20 outline-none"
                style={{
                  background: 'rgba(0,200,220,0.07)',
                  border: '1px solid rgba(0,200,220,0.22)',
                  borderRadius: '0.65rem',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.8rem',
                  transition: 'border-color 0.25s ease',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,200,220,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,200,220,0.22)')}
              />
              <button
                type="submit"
                className="btn-glass flex-shrink-0"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
              >
                Set
              </button>
            </form>

            {deviceLocation && (
              <div
                className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
                style={{
                  background: 'rgba(0,200,220,0.08)',
                  border: '1px solid rgba(0,200,220,0.2)',
                  animation: 'fadeInUp 0.25s ease',
                }}
              >
                <MapPin className="w-3.5 h-3.5 text-dash-cyan flex-shrink-0" />
                <span className="font-mono text-dash-cyan" style={{ fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                  micro:bit Location:{' '}
                  <span className="text-white/80">{deviceLocation}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
