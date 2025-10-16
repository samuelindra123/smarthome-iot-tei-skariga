// Shared presence utilities for ESP32 device monitoring
// Strategy:
//  - Device publishes retained 'online' on connect (and optionally periodic heartbeat)
//  - Device sets MQTT Last Will & Testament retained 'offline'
//  - Frontend interprets presence topic + lastSeen timestamps + timeout fallback
//  - Offline conditions:
//      * Explicit payload 'offline' (source: 'lwt')
//      * No heartbeat/status after OFFLINE_TIMEOUT_MS (source: 'timeout')
//  - Online condition:
//      * Payload 'online' OR any accepted heartbeat/status update (source: 'heartbeat'/'status')

export const PRESENCE_TOPIC = 'smarthome/device/esp32s2mini/presence';

export interface PresenceModel {
  state: 'online' | 'offline' | 'unknown';
  lastSeen: number | null;
  lastPayload?: string | null;
  source?: 'status' | 'presence' | 'heartbeat' | 'lwt' | 'timeout';
  reason?: string; // human friendly explanation
}

export const HEARTBEAT_INTERVAL_MS = 10_000; // expected device heartbeat or status publish period
export const OFFLINE_TIMEOUT_MS = HEARTBEAT_INTERVAL_MS * 3; // fallback threshold

export function evaluateTimeout(prev: PresenceModel): PresenceModel {
  if (!prev.lastSeen) return prev;
  const delta = Date.now() - prev.lastSeen;
  if (delta > OFFLINE_TIMEOUT_MS && prev.state !== 'offline') {
    return { ...prev, state: 'offline', source: 'timeout', reason: `No heartbeat > ${Math.round(OFFLINE_TIMEOUT_MS/1000)}s` };
  }
  return prev;
}

export function presenceFromPayload(payload: string): { state: PresenceModel['state']; source: PresenceModel['source'] } {
  if (payload === 'online') return { state: 'online', source: 'presence' };
  if (payload === 'offline') return { state: 'offline', source: 'lwt' };
  // Could extend for JSON heartbeat etc.
  return { state: 'online', source: 'heartbeat' }; // default treat unknown payload as heartbeat signal
}
