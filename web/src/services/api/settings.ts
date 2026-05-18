/**
 * Settings API – Phase 3 (ADMIN_API_PHASE3.md)
 * GET/PUT /admin/settings — key/value pairs from backend
 */

import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

export interface AppSettings {
  general: {
    appName: string;
    appLogo?: string;
    defaultLanguage: string;
    timezone: string;
    currency: string;
    taxRate: number;
    deliveryFee: number;
    minOrderAmount: number;
    maintenanceMode: boolean;
  };
  payment: {
    paymentMethods: string[];
    commissionRate: number;
    payoutSchedule: 'daily' | 'weekly' | 'monthly';
    autoPayout: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    orderNotifications: boolean;
    marketingNotifications: boolean;
  };
  delivery: {
    maxDeliveryDistance: number;
    estimatedDeliveryTime: number;
    driverAssignment: 'auto' | 'manual';
    deliveryBaseFee: number;
    deliveryFreeKm: number;
    deliveryPricePerKm: number;
  };
  restaurant: {
    autoApprove: boolean;
    commissionRate: number;
    minRating: number;
  };
  support: {
    supportEmail: string;
    supportPhone1: string;
    supportPhone2: string;
    supportAddress: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
  };
  loyalty: {
    earnRate: number;
    redeemRate: number;
    expiryDays: number;
  };
}

export interface ApiSettingItem {
  key: string;
  value: string;
  description?: string;
  updatedAt?: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    appName: 'Souq',
    defaultLanguage: 'ar',
    timezone: 'Africa/Cairo',
    currency: 'EGP',
    taxRate: 0,
    deliveryFee: 20,
    minOrderAmount: 50,
    maintenanceMode: false,
  },
  payment: {
    paymentMethods: ['cash', 'card'],
    commissionRate: 10,
    payoutSchedule: 'weekly',
    autoPayout: true,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    orderNotifications: true,
    marketingNotifications: false,
  },
  delivery: {
    maxDeliveryDistance: 20,
    estimatedDeliveryTime: 45,
    driverAssignment: 'auto',
    deliveryBaseFee: 20,
    deliveryFreeKm: 2,
    deliveryPricePerKm: 10,
  },
  restaurant: {
    autoApprove: false,
    commissionRate: 15,
    minRating: 4.0,
  },
  support: {
    supportEmail: 'support@souqegy.net',
    supportPhone1: '+201091717188',
    supportPhone2: '+201000431699',
    supportAddress: 'ذكرنس، دقهلية، مصر',
    privacyPolicyUrl: 'https://www.souqegy.net/privacy',
    termsOfServiceUrl: 'https://www.souqegy.net/terms',
  },
  loyalty: {
    earnRate: 1,
    redeemRate: 0.1,
    expiryDays: 90,
  },
};

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback;
  return value === 'true' || value === '1';
}

function parseNum(value: string | undefined, fallback: number): number {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function apiItemsToMap(items: ApiSettingItem[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of items) {
    map[item.key] = item.value;
  }
  return map;
}

export function mapApiSettingsToApp(items: ApiSettingItem[]): AppSettings {
  const m = apiItemsToMap(items);
  const base: AppSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

  base.general.minOrderAmount = parseNum(m.min_order_amount, base.general.minOrderAmount);
  base.general.maintenanceMode = parseBool(m.maintenance_mode, base.general.maintenanceMode);
  base.general.deliveryFee = parseNum(m.delivery_base_fee, base.general.deliveryFee);

  base.delivery.deliveryBaseFee = parseNum(m.delivery_base_fee, base.delivery.deliveryBaseFee);
  base.delivery.deliveryPricePerKm = parseNum(m.delivery_price_per_km, base.delivery.deliveryPricePerKm);
  base.delivery.deliveryFreeKm = parseNum(m.delivery_free_km, base.delivery.deliveryFreeKm);
  base.delivery.maxDeliveryDistance = parseNum(
    m.max_delivery_distance_km,
    base.delivery.maxDeliveryDistance
  );

  base.loyalty.earnRate = parseNum(m.loyalty_earn_rate, base.loyalty.earnRate);
  base.loyalty.redeemRate = parseNum(m.loyalty_redeem_rate, base.loyalty.redeemRate);
  base.loyalty.expiryDays = parseNum(m.loyalty_expiry_days, base.loyalty.expiryDays);

  return base;
}

/** Map a UI section to backend keys for PUT /admin/settings */
export function mapAppSectionToApiKeys(
  section: keyof AppSettings,
  data: Partial<AppSettings[keyof AppSettings]>
): Record<string, string> {
  const out: Record<string, string> = {};
  const d = data as Record<string, unknown>;

  switch (section) {
    case 'general':
      if (d.minOrderAmount != null) out.min_order_amount = String(d.minOrderAmount);
      if (d.maintenanceMode != null) out.maintenance_mode = String(d.maintenanceMode);
      if (d.deliveryFee != null) out.delivery_base_fee = String(d.deliveryFee);
      break;
    case 'delivery':
      if (d.deliveryBaseFee != null) out.delivery_base_fee = String(d.deliveryBaseFee);
      if (d.deliveryPricePerKm != null) out.delivery_price_per_km = String(d.deliveryPricePerKm);
      if (d.deliveryFreeKm != null) out.delivery_free_km = String(d.deliveryFreeKm);
      if (d.maxDeliveryDistance != null) out.max_delivery_distance_km = String(d.maxDeliveryDistance);
      break;
    case 'loyalty':
      if (d.earnRate != null) out.loyalty_earn_rate = String(d.earnRate);
      if (d.redeemRate != null) out.loyalty_redeem_rate = String(d.redeemRate);
      if (d.expiryDays != null) out.loyalty_expiry_days = String(d.expiryDays);
      break;
    default:
      break;
  }

  return out;
}

function unwrapSettingsList(data: unknown): ApiSettingItem[] {
  const body = data as { data?: ApiSettingItem[] };
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(data)) return data as ApiSettingItem[];
  return [];
}

async function realGetSettings(): Promise<AppSettings> {
  const res = await apiClient.get('/admin/settings');
  const items = unwrapSettingsList(res.data);
  if (items.length === 0) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  return mapApiSettingsToApp(items);
}

async function realUpdateSettings(
  section: keyof AppSettings,
  data: Partial<AppSettings[keyof AppSettings]>
): Promise<AppSettings> {
  const settings = mapAppSectionToApiKeys(section, data);
  if (Object.keys(settings).length === 0) {
    return realGetSettings();
  }
  await apiClient.put('/admin/settings', { settings });
  return realGetSettings();
}

// ——— Mock ———

let mockSettings: AppSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

export async function mockGetSettings(): Promise<AppSettings> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return JSON.parse(JSON.stringify(mockSettings));
}

export async function mockUpdateSettings(
  section: keyof AppSettings,
  data: Partial<AppSettings[keyof AppSettings]>
): Promise<AppSettings> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockSettings = {
    ...mockSettings,
    [section]: {
      ...mockSettings[section],
      ...data,
    },
  };
  return JSON.parse(JSON.stringify(mockSettings));
}

export async function getSettings(): Promise<AppSettings> {
  try {
    return shouldUseMock() ? mockGetSettings() : realGetSettings();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateSettings(
  section: keyof AppSettings,
  data: Partial<AppSettings[keyof AppSettings]>
): Promise<AppSettings> {
  try {
    return shouldUseMock()
      ? mockUpdateSettings(section, data)
      : realUpdateSettings(section, data);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
