/**
 * Geofence settings API — P2 handoff §2
 * GET/PUT /admin/settings/geofence
 */

import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

/** Vertex as [latitude, longitude] */
export type GeofenceVertex = [number, number];

export interface GeofenceSettings {
  enabled: boolean;
  polygon: GeofenceVertex[];
  message_ar: string;
  message_en: string;
}

const DEFAULT_GEOFENCE: GeofenceSettings = {
  enabled: false,
  polygon: [],
  message_ar: 'التوصيل غير متاح في منطقتك',
  message_en: 'Delivery is not available in your area',
};

function mapGeofence(raw: Record<string, unknown>): GeofenceSettings {
  const poly = raw.polygon;
  let polygon: GeofenceVertex[] = [];
  if (Array.isArray(poly)) {
    polygon = poly
      .map((p) => {
        if (!Array.isArray(p) || p.length < 2) return null;
        return [Number(p[0]), Number(p[1])] as GeofenceVertex;
      })
      .filter((p): p is GeofenceVertex => p != null && p.every((n) => Number.isFinite(n)));
  }
  return {
    enabled: Boolean(raw.enabled ?? false),
    polygon,
    message_ar: String(raw.message_ar ?? raw.messageAr ?? DEFAULT_GEOFENCE.message_ar),
    message_en: String(raw.message_en ?? raw.messageEn ?? DEFAULT_GEOFENCE.message_en),
  };
}

function unwrapBody(data: unknown): Record<string, unknown> {
  const d = data as { data?: Record<string, unknown> };
  return (d?.data ?? data) as Record<string, unknown>;
}

async function realGetGeofenceSettings(): Promise<GeofenceSettings> {
  const res = await apiClient.get('/admin/settings/geofence');
  return mapGeofence(unwrapBody(res.data));
}

async function realUpdateGeofenceSettings(payload: GeofenceSettings): Promise<GeofenceSettings> {
  const res = await apiClient.put('/admin/settings/geofence', payload);
  return mapGeofence(unwrapBody(res.data));
}

let mockGeofence: GeofenceSettings = {
  ...DEFAULT_GEOFENCE,
  polygon: [
    [30.05, 31.23],
    [30.06, 31.25],
    [30.04, 31.26],
  ],
};

async function mockGetGeofenceSettings(): Promise<GeofenceSettings> {
  await new Promise((r) => setTimeout(r, 250));
  return JSON.parse(JSON.stringify(mockGeofence));
}

async function mockUpdateGeofenceSettings(payload: GeofenceSettings): Promise<GeofenceSettings> {
  await new Promise((r) => setTimeout(r, 300));
  mockGeofence = JSON.parse(JSON.stringify(payload));
  return mockGeofence;
}

export async function getGeofenceSettings(): Promise<GeofenceSettings> {
  try {
    return shouldUseMock() ? mockGetGeofenceSettings() : realGetGeofenceSettings();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateGeofenceSettings(payload: GeofenceSettings): Promise<GeofenceSettings> {
  try {
    return shouldUseMock()
      ? mockUpdateGeofenceSettings(payload)
      : realUpdateGeofenceSettings(payload);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
