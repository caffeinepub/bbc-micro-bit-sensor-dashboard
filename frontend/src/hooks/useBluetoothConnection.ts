import { useCallback, useRef, useState } from 'react';

// ── Web Bluetooth API type declarations ──────────────────────────────────────
interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  readonly value: DataView | null;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void;
  removeEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(uuid: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTServer {
  readonly connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(uuid: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothDevice extends EventTarget {
  readonly name?: string;
  readonly gatt?: BluetoothRemoteGATTServer;
  addEventListener(type: 'gattserverdisconnected', listener: () => void): void;
  removeEventListener(type: 'gattserverdisconnected', listener: () => void): void;
}

interface RequestDeviceOptions {
  filters?: Array<{ namePrefix?: string; name?: string; services?: string[] }>;
  optionalServices?: string[];
  acceptAllDevices?: boolean;
}

interface Bluetooth {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
}

interface NavigatorWithBluetooth extends Navigator {
  bluetooth: Bluetooth;
}
// ─────────────────────────────────────────────────────────────────────────────

// micro:bit BLE UART service UUIDs
const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const UART_RX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

export type BLEConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseBluetoothConnectionOptions {
  onData: (chunk: string) => void;
  onDisconnect?: () => void;
}

export function useBluetoothConnection({ onData, onDisconnect }: UseBluetoothConnectionOptions) {
  const [status, setStatus] = useState<BLEConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [packetsReceived, setPacketsReceived] = useState(0);

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const packetsRef = useRef(0);
  const rateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPacketCountRef = useRef(0);
  const dataRateRef = useRef(0);

  const stopRateTimer = useCallback(() => {
    if (rateTimerRef.current) {
      clearInterval(rateTimerRef.current);
      rateTimerRef.current = null;
    }
  }, []);

  const startRateTimer = useCallback(() => {
    stopRateTimer();
    rateTimerRef.current = setInterval(() => {
      const rate = packetsRef.current - lastPacketCountRef.current;
      lastPacketCountRef.current = packetsRef.current;
      dataRateRef.current = rate;
      setPacketsReceived(packetsRef.current);
    }, 1000);
  }, [stopRateTimer]);

  const handleNotification = useCallback(
    (event: Event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      const value = target.value;
      if (!value) return;
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(value);
      packetsRef.current++;
      onData(text);
    },
    [onData]
  );

  const disconnect = useCallback(() => {
    stopRateTimer();
    if (characteristicRef.current) {
      try {
        characteristicRef.current.removeEventListener('characteristicvaluechanged', handleNotification);
        characteristicRef.current.stopNotifications().catch(() => {});
      } catch {
        // ignore
      }
      characteristicRef.current = null;
    }
    if (deviceRef.current?.gatt?.connected) {
      try {
        deviceRef.current.gatt.disconnect();
      } catch {
        // ignore
      }
    }
    deviceRef.current = null;
    setStatus('disconnected');
    setError(null);
    onDisconnect?.();
  }, [handleNotification, onDisconnect, stopRateTimer]);

  const connect = useCallback(async () => {
    const nav = navigator as NavigatorWithBluetooth;
    if (!nav.bluetooth) {
      setError('Web Bluetooth is not supported in this browser. Please use Chrome or Edge.');
      setStatus('error');
      return;
    }

    setStatus('connecting');
    setError(null);

    try {
      const device = await nav.bluetooth.requestDevice({
        filters: [{ namePrefix: 'BBC micro:bit' }],
        optionalServices: [UART_SERVICE_UUID],
      });

      deviceRef.current = device;

      device.addEventListener('gattserverdisconnected', () => {
        stopRateTimer();
        setStatus('disconnected');
        onDisconnect?.();
      });

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(UART_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);

      characteristicRef.current = characteristic;
      characteristic.addEventListener('characteristicvaluechanged', handleNotification);
      await characteristic.startNotifications();

      packetsRef.current = 0;
      lastPacketCountRef.current = 0;
      startRateTimer();
      setStatus('connected');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bluetooth connection failed';
      if (msg.includes('User cancelled') || msg.includes('chooser')) {
        setStatus('disconnected');
      } else {
        setError(msg);
        setStatus('error');
      }
    }
  }, [handleNotification, onDisconnect, startRateTimer, stopRateTimer]);

  return {
    status,
    error,
    packetsReceived,
    dataRate: dataRateRef.current,
    connect,
    disconnect,
  };
}
