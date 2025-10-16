'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';

const MQTT_BROKER_URL = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'wss://mqtt.tecnoverse.app:8081';

type MqttCtx = {
  client: MqttClient | null;
  connected: boolean;
  reconnecting: boolean;
  publish: (topic: string, payload: string | Buffer) => void;
  subscribe: (topics: string | string[], cb?: (err?: Error) => void) => void;
  onMessage: (handler: (topic: string, payload: Buffer) => void) => () => void;
};

const Context = createContext<MqttCtx | null>(null);

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const clientRef = useRef<MqttClient | null>(null);
  const handlerRef = useRef<((topic: string, payload: Buffer) => void)[]>([]);

  const pendingRef = useRef<Array<{ topic: string; payload: string | Buffer }>>([]);
  const pendingSubs = useRef<Array<{ topics: string | string[]; cb?: (err?: Error) => void }>>([]);

  useEffect(() => {
    if (!MQTT_BROKER_URL) {
      console.info('[mqtt] NEXT_PUBLIC_MQTT_BROKER_URL not set - skipping MQTT connect (dev mode)');
      return;
    }

    let triedFallback = false;
    let currentUrl = MQTT_BROKER_URL;

    const connectClient = (url: string) => {
      console.info('[mqtt] connecting to', url);
      return mqtt.connect(url, {
        reconnectPeriod: 2000,
        clean: true,
        connectTimeout: 10000,
        queueQoSZero: true,
        resubscribe: true,
      });
    };

    const attachClient = (c: MqttClient) => {
      setClient(c);
      clientRef.current = c;

      const onConnect = () => {
        setConnected(true); setReconnecting(false);
        // flush any buffered publishes made before client existed
        const items = pendingRef.current.splice(0, pendingRef.current.length);
        for (const it of items) {
          try { c.publish(it.topic, it.payload); } catch {}
        }
        // flush any pending subscriptions
        const subs = pendingSubs.current.splice(0, pendingSubs.current.length);
        for (const s of subs) {
          try {
            c.subscribe(s.topics, (err) => s.cb?.(err || undefined));
          } catch (e: any) {
            s.cb?.(e instanceof Error ? e : new Error(String(e)));
          }
        }
      };

      const onReconnect = () => { setReconnecting(true); setConnected(false); };
      const onClose = () => { setConnected(false); };
      const onMessage = (topic: string, payload: Buffer) => { handlerRef.current.forEach(fn => { try { fn(topic, payload); } catch {} }); };

      c.on('connect', onConnect);
      c.on('reconnect', onReconnect);
      c.on('close', onClose);
      c.on('message', onMessage);
      c.on('error', (err: any) => {
        // quieter logging: warn once about connectivity and attempt fallback for wss->ws once
        const msg = err && err.message ? err.message : String(err);
        console.warn('[mqtt] connection issue:', msg);
        setConnected(false);

        if (!triedFallback && currentUrl.startsWith('wss://')) {
          triedFallback = true;
          const fallback = currentUrl.replace(/^wss:/, 'ws:');
          console.info('[mqtt] attempting fallback to', fallback);
          try { c.end(true); } catch {}
          try {
            currentUrl = fallback;
            const nc = connectClient(fallback);
            attachClient(nc);
          } catch (e) {
            console.warn('[mqtt] fallback connect failed', e);
          }
        }
      });
    };

    // initial connect
    try {
      const c = connectClient(currentUrl);
      attachClient(c);
    } catch (e) {
      console.warn('[mqtt] initial connect failed', e);
    }

    return () => {
      try { if (clientRef.current) clientRef.current.end(true); } catch {};
      setClient(null);
      clientRef.current = null;
      handlerRef.current = [];
    };
  }, []);

  const publish = useCallback((topic: string, payload: string | Buffer) => {
    const c = clientRef.current;
    if (!c) { pendingRef.current.push({ topic, payload }); return; }
    try { c.publish(topic, payload); } catch {}
  }, []);

  const subscribe = useCallback((topics: string | string[], cb?: (err?: Error) => void) => {
    const c = clientRef.current;
    if (!c) {
      // queue the subscription to be attempted when connected
      pendingSubs.current.push({ topics, cb });
      return;
    }
    try { c.subscribe(topics, (err) => cb?.(err || undefined)); } catch (e: any) { cb?.(e); }
  }, []);

  const onMessage = useCallback((handler: (topic: string, payload: Buffer) => void) => {
    handlerRef.current.push(handler);
    return () => { handlerRef.current = handlerRef.current.filter(h => h !== handler); };
  }, []);

  const value = useMemo(() => ({ client, connected, reconnecting, publish, subscribe, onMessage }), [client, connected, reconnecting, publish, subscribe, onMessage]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useMqtt() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useMqtt must be used within MqttProvider');
  return ctx;
}
