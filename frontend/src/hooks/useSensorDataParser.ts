import { useCallback, useRef } from 'react';
import { SensorData } from '../types/sensor';

export function useSensorDataParser(onData: (data: SensorData) => void) {
  const bufferRef = useRef('');
  const lastUpdateRef = useRef(0);
  const pendingDataRef = useRef<SensorData | null>(null);
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processBuffer = useCallback(() => {
    const buffer = bufferRef.current;
    let start = -1;
    let depth = 0;

    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (buffer[i] === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          const jsonStr = buffer.slice(start, i + 1);
          try {
            const parsed = JSON.parse(jsonStr);
            if (
              typeof parsed.t === 'number' &&
              typeof parsed.l === 'number' &&
              typeof parsed.c === 'number' &&
              typeof parsed.s === 'number' &&
              typeof parsed.storm === 'number' &&
              typeof parsed.ultra === 'number'
            ) {
              pendingDataRef.current = parsed as SensorData;
            }
          } catch {
            // Silently discard malformed JSON
          }
          bufferRef.current = buffer.slice(i + 1);
          start = -1;
          depth = 0;
          // Restart from beginning of new buffer
          return processBuffer();
        }
      }
    }

    // Trim buffer if it gets too large (prevent memory leak)
    if (bufferRef.current.length > 4096) {
      bufferRef.current = bufferRef.current.slice(-512);
    }
  }, []);

  const flushPending = useCallback(() => {
    if (pendingDataRef.current) {
      onData(pendingDataRef.current);
      pendingDataRef.current = null;
    }
    lastUpdateRef.current = Date.now();
  }, [onData]);

  const pushChunk = useCallback(
    (chunk: string) => {
      bufferRef.current += chunk;
      processBuffer();

      const now = Date.now();
      const timeSinceLast = now - lastUpdateRef.current;

      if (timeSinceLast >= 1000) {
        // Enough time has passed — flush immediately
        flushPending();
      } else {
        // Schedule a flush after the remaining time
        if (throttleTimerRef.current) {
          clearTimeout(throttleTimerRef.current);
        }
        throttleTimerRef.current = setTimeout(() => {
          flushPending();
        }, 1000 - timeSinceLast);
      }
    },
    [processBuffer, flushPending]
  );

  const reset = useCallback(() => {
    bufferRef.current = '';
    pendingDataRef.current = null;
    lastUpdateRef.current = 0;
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
  }, []);

  return { pushChunk, reset };
}
