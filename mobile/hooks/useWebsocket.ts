import { useEffect, useRef } from 'react';

export function useWebSocket(
  url: string,
  {
    onOpen,
    onMessage,
    onError,
    onClose,
    retryDelay = 1000,
    maxDelay = 30000,
    shouldReconnect = (ev: CloseEvent) => !ev.wasClean && ev.code !== 1000 && ev.code !== 1001,
  }: {
    onOpen?: (e: Event) => void;
    onMessage?: (e: MessageEvent) => void;
    onError?: (e: Event) => void;
    onClose?: (e: CloseEvent) => void;
    retryDelay?: number;
    maxDelay?: number;
    shouldReconnect?: (e: CloseEvent) => boolean;
  } = {}
) {
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);
  const triesRef = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;

    const clearTimer = () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const backOff = () => Math.min(retryDelay * 2 ** Math.max(0, triesRef.current - 1), maxDelay);

    const connect = () => {
      clearTimer();

      if (!url || url.trim() === '') {
        return;
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (e) => {
        triesRef.current = 0;
        onOpen?.(e);
      };

      ws.onmessage = (e) => onMessage?.(e);

      ws.onerror = (e) => onError?.(e);

      ws.onclose = (e) => {
        onClose?.(e);

        if (alive.current && shouldReconnect(e)) {
          triesRef.current += 1;
          timerRef.current = window.setTimeout(connect, backOff());
        }
      };
    };

    connect();

    return () => {
      alive.current = false;
      clearTimer();
      wsRef.current?.close(1000);
    };
  }, [url]);
}
