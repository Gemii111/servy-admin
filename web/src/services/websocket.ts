/**
 * WebSocket helpers for admin live updates — Handoff §12
 */

import { env } from '../config/env';

function wsBaseUrl(): string {
  const api = env.apiBaseUrl.replace(/^http/, 'ws').replace(/\/$/, '');
  if (env.websocketUrl && !env.websocketUrl.includes('servy.app')) {
    return env.websocketUrl.replace(/\/$/, '');
  }
  return api;
}

export type WsMessageHandler = (payload: unknown) => void;

export function connectAdminWebSocket(
  path: string,
  onMessage: WsMessageHandler,
  onError?: (err: Event) => void
): WebSocket | null {
  if (typeof WebSocket === 'undefined') return null;

  const authRaw = localStorage.getItem('servy_admin_auth');
  let token = '';
  if (authRaw) {
    try {
      token = JSON.parse(authRaw).token || '';
    } catch {
      token = '';
    }
  }

  const base = wsBaseUrl();
  const sep = path.startsWith('/') ? '' : '/';
  const url = `${base}${sep}${path}${token ? `?token=${encodeURIComponent(token)}` : ''}`;

  try {
    const ws = new WebSocket(url);
    ws.onmessage = (ev) => {
      try {
        onMessage(JSON.parse(ev.data));
      } catch {
        onMessage(ev.data);
      }
    };
    ws.onerror = (e) => onError?.(e);
    return ws;
  } catch {
    return null;
  }
}

export function connectOrdersFeed(onMessage: WsMessageHandler): WebSocket | null {
  return connectAdminWebSocket('/ws/orders', onMessage);
}

export function connectOrderTracking(
  orderId: string,
  onMessage: WsMessageHandler
): WebSocket | null {
  return connectAdminWebSocket(`/ws/order/${orderId}`, onMessage);
}
