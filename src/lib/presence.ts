// Shared presence utilities for ESP32 device monitoring
// Strategy:
//  - Device publishes retained 'online' on connect (and optionally periodic heartbeat)
//  - Device sets MQTT Last Will & Testament retained 'offline'
//  - Frontend interprets presence topic + lastSeen timestamps + timeout fallback
//  - Offline conditions:
//      * Explicit payload 'offline' (source: 'lwt') — INSTANT OFFLINE (real-time)
//      * No heartbeat/status after OFFLINE_TIMEOUT_MS (source: 'timeout')
//  - Online condition:
//      * Payload 'online' OR any accepted heartbeat/status update (source: 'heartbeat'/'status')

// FIXED: Match actual MQTT topic from ESP32 device (visible in MQTT Explorer)
export const PRESENCE_TOPIC = 'smarthome/controller/presence';

export interface PresenceModel {
  state: 'online' | 'offline' | 'unknown';
  lastSeen: number | null;
  lastPayload?: string | null;
  source?: 'status' | 'presence' | 'heartbeat' | 'lwt' | 'timeout';
  reason?: string; // human friendly explanation
}

// Reduced intervals for faster detection (real-time presence)
export const HEARTBEAT_INTERVAL_MS = 5_000; // expected device heartbeat or status publish period (5s)
export const OFFLINE_TIMEOUT_MS = HEARTBEAT_INTERVAL_MS * 2; // fallback threshold (10s instead of 30s)

export function evaluateTimeout(prev: PresenceModel): PresenceModel {
  // Don't evaluate timeout if no presence data received yet
  if (!prev.lastSeen) return prev;
  
  // If already marked offline by LWT, NEVER override - wait for explicit 'online' message
  if (prev.state === 'offline' && prev.source === 'lwt') return prev;
  
  // Only apply timeout if device was previously online
  if (prev.state === 'online') {
    const delta = Date.now() - prev.lastSeen;
    if (delta > OFFLINE_TIMEOUT_MS) {
      return { ...prev, state: 'offline', source: 'timeout', reason: `No heartbeat > ${Math.round(OFFLINE_TIMEOUT_MS/1000)}s` };
    }
  }
  
  return prev;
}

export function presenceFromPayload(payload: string): { state: PresenceModel['state']; source: PresenceModel['source'] } {
  // Instant offline detection from MQTT LWT (Last Will & Testament)
  if (payload === 'offline') return { state: 'offline', source: 'lwt' };
  if (payload === 'online') return { state: 'online', source: 'presence' };
  // Could extend for JSON heartbeat etc.
  return { state: 'online', source: 'heartbeat' }; // default treat unknown payload as heartbeat signal
}
