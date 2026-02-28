import { useCallback, useRef, useState } from 'react';

// ── Web Serial API type declarations ─────────────────────────────────────────
interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface SerialPort {
  // Use BufferSource so it's compatible with TextDecoderStream.writable
  readonly readable: ReadableStream<BufferSource> | null;
  readonly writable: WritableStream<BufferSource> | null;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  getInfo(): SerialPortInfo;
}

interface Serial {
  requestPort(options?: { filters?: SerialPortInfo[] }): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
}

interface NavigatorWithSerial extends Navigator {
  serial: Serial;
}
// ─────────────────────────────────────────────────────────────────────────────

export type SerialConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseSerialConnectionOptions {
  onData: (chunk: string) => void;
  onDisconnect?: () => void;
}

export function useSerialConnection({ onData, onDisconnect }: UseSerialConnectionOptions) {
  const [status, setStatus] = useState<SerialConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [packetsReceived, setPacketsReceived] = useState(0);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const packetsRef = useRef(0);
  const rateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPacketCountRef = useRef(0);
  const dataRateRef = useRef(0);
  const readingRef = useRef(false);

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

  const disconnect = useCallback(async () => {
    readingRef.current = false;
    stopRateTimer();

    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch {
        // ignore
      }
      readerRef.current = null;
    }

    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch {
        // ignore
      }
      portRef.current = null;
    }

    setStatus('disconnected');
    setError(null);
    onDisconnect?.();
  }, [onDisconnect, stopRateTimer]);

  const connect = useCallback(async () => {
    const nav = navigator as NavigatorWithSerial;
    if (!('serial' in navigator)) {
      setError('Web Serial is not supported in this browser. Please use Chrome or Edge.');
      setStatus('error');
      return;
    }

    setStatus('connecting');
    setError(null);

    try {
      const port = await nav.serial.requestPort();
      portRef.current = port;

      await port.open({ baudRate: 115200 });

      packetsRef.current = 0;
      lastPacketCountRef.current = 0;
      startRateTimer();
      setStatus('connected');

      // Start reading
      readingRef.current = true;
      const textDecoder = new TextDecoderStream();
      // port.readable is ReadableStream<BufferSource>, compatible with TextDecoderStream.writable
      const readableStreamClosed = port.readable!.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      // Read loop (runs in background)
      (async () => {
        try {
          while (readingRef.current) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              packetsRef.current++;
              onData(value);
            }
          }
        } catch (err) {
          if (readingRef.current) {
            const msg = err instanceof Error ? err.message : 'Serial read error';
            setError(msg);
            setStatus('error');
          }
        } finally {
          readableStreamClosed.catch(() => {});
          stopRateTimer();
          onDisconnect?.();
        }
      })();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Serial connection failed';
      if (
        msg.includes('No port selected') ||
        msg.includes('cancelled') ||
        msg.includes('user gesture')
      ) {
        setStatus('disconnected');
      } else {
        setError(msg);
        setStatus('error');
      }
    }
  }, [onData, onDisconnect, startRateTimer, stopRateTimer]);

  return {
    status,
    error,
    packetsReceived,
    dataRate: dataRateRef.current,
    connect,
    disconnect,
  };
}
