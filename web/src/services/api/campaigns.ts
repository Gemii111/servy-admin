/**
 * Campaigns API Service — Handoff §11
 */

import axios from 'axios';
import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock, unwrap, extractListFromResponse } from './base';

export type UserSegment = 'new_user' | 'loyal_user' | 'all';
export type CampaignStatus = 'active' | 'inactive' | 'expired' | 'draft';

const CAMPAIGN_STATUSES: CampaignStatus[] = ['active', 'inactive', 'expired', 'draft'];

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  start_date: string;
  end_date: string;
  user_segment: UserSegment;
  restaurant_id?: string;
  banner_id?: string;
  coupon_id?: string;
  loyalty_bonus_points?: number;
  loyalty_multiplier?: number;
  notification_title?: string;
  notification_body?: string;
  notification_sent: boolean;
  created_at: string;
}

const USER_SEGMENT_LABELS: Record<UserSegment, string> = {
  new_user: 'مستخدم جديد',
  loyal_user: 'عميل مخلص',
  all: 'الكل',
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  expired: 'منتهي',
  draft: 'مسودة',
};

function normalizeCampaignStatus(value: unknown): CampaignStatus {
  const s = String(value ?? 'draft').toLowerCase();
  return CAMPAIGN_STATUSES.includes(s as CampaignStatus) ? (s as CampaignStatus) : 'draft';
}

/** FCM topics for campaign push — backend contract 2026-05-19 (see campaign-notification-tap-flutter.md). */
export const CAMPAIGN_FCM_TOPICS: Record<UserSegment, string> = {
  all: 'campaigns_all',
  new_user: 'campaigns_new_user',
  loyal_user: 'campaigns_loyal_user',
};

export function getCampaignFcmTopic(segment: UserSegment): string {
  return CAMPAIGN_FCM_TOPICS[segment] ?? CAMPAIGN_FCM_TOPICS.all;
}

/** Matches backend FCM `data` map from POST /admin/campaigns/:id/notify */
export function buildCampaignNotificationData(campaign: Campaign): Record<string, string> {
  const data: Record<string, string> = {
    type: 'campaign',
    campaign_id: campaign.id,
  };
  if (campaign.coupon_id) data.coupon_id = campaign.coupon_id;
  if (campaign.restaurant_id) data.restaurant_id = campaign.restaurant_id;
  if (campaign.banner_id) data.banner_id = campaign.banner_id;
  return data;
}

function segmentToNotificationTopic(segment: UserSegment): string {
  return getCampaignFcmTopic(segment);
}

// Mock data
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'عرض رمضان',
    description: 'خصومات خاصة في شهر رمضان',
    status: 'active',
    start_date: '2026-02-01',
    end_date: '2026-03-01',
    user_segment: 'all',
    loyalty_bonus_points: 50,
    loyalty_multiplier: 1.5,
    notification_title: 'عرض رمضان',
    notification_body: 'استمتع بخصومات رمضان',
    notification_sent: true,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'ترحيب بالعملاء الجدد',
    description: 'كوبون خصم 20% للعملاء الجدد',
    status: 'active',
    start_date: '2026-02-10',
    end_date: '2026-04-10',
    user_segment: 'new_user',
    coupon_id: 'c1',
    notification_sent: false,
    created_at: '2026-02-10T10:00:00Z',
  },
];

export const getCampaignStatusLabel = (status: string) =>
  STATUS_LABELS[status as CampaignStatus] || status;
export const getCampaignUserSegmentLabel = (seg: UserSegment) =>
  USER_SEGMENT_LABELS[seg] || seg;

export async function mockGetCampaigns(params?: {
  status?: string;
}): Promise<Campaign[]> {
  await new Promise((r) => setTimeout(r, 300));
  let result = [...mockCampaigns];
  if (params?.status) {
    result = result.filter((c) => c.status === params.status);
  }
  return result;
}

export async function mockCreateCampaign(data: Partial<Campaign>): Promise<Campaign> {
  await new Promise((r) => setTimeout(r, 300));
  const campaign: Campaign = {
    id: `c${Date.now()}`,
    name: data.name || '',
    description: data.description || '',
    status: (data.status as Campaign['status']) || 'active',
    start_date: data.start_date || new Date().toISOString().slice(0, 10),
    end_date: data.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    user_segment: (data.user_segment as UserSegment) || 'all',
    restaurant_id: data.restaurant_id,
    banner_id: data.banner_id,
    coupon_id: data.coupon_id,
    loyalty_bonus_points: data.loyalty_bonus_points,
    loyalty_multiplier: data.loyalty_multiplier,
    notification_title: data.notification_title,
    notification_body: data.notification_body,
    notification_sent: false,
    created_at: new Date().toISOString(),
  };
  mockCampaigns.push(campaign);
  return campaign;
}

export async function mockUpdateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockCampaigns.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('الحملة غير موجودة');
  mockCampaigns[idx] = { ...mockCampaigns[idx], ...data };
  return mockCampaigns[idx];
}

export async function mockSendCampaignNotification(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockCampaigns.findIndex((c) => c.id === id);
  if (idx !== -1) mockCampaigns[idx].notification_sent = true;
}

function toIsoDate(dateStr: string, endOfDay = false): string {
  if (!dateStr) return dateStr;
  if (dateStr.includes('T')) return dateStr;
  return endOfDay ? `${dateStr}T23:59:59.000Z` : `${dateStr}T00:00:00.000Z`;
}

/** POST/PUT body — snake_case + camelCase (Go backend may bind either). */
function buildCampaignApiPayload(data: Partial<Campaign>): Record<string, unknown> {
  const startIso = data.start_date ? toIsoDate(data.start_date, false) : undefined;
  const endIso = data.end_date ? toIsoDate(data.end_date, true) : undefined;

  const body: Record<string, unknown> = {
    name: data.name,
    description: data.description ?? '',
    status: data.status ?? 'active',
    user_segment: data.user_segment ?? 'all',
    userSegment: data.user_segment ?? 'all',
  };

  if (startIso) {
    body.start_date = startIso;
    body.startDate = startIso;
  }
  if (endIso) {
    body.end_date = endIso;
    body.endDate = endIso;
  }
  if (data.restaurant_id) {
    body.restaurant_id = data.restaurant_id;
    body.restaurantId = data.restaurant_id;
  }
  if (data.banner_id) {
    body.banner_id = data.banner_id;
    body.bannerId = data.banner_id;
  }
  if (data.coupon_id) {
    body.coupon_id = data.coupon_id;
    body.couponId = data.coupon_id;
  }
  if (data.loyalty_bonus_points != null && !Number.isNaN(data.loyalty_bonus_points)) {
    body.loyalty_bonus_points = data.loyalty_bonus_points;
    body.loyaltyBonusPoints = data.loyalty_bonus_points;
  }
  if (data.loyalty_multiplier != null && !Number.isNaN(data.loyalty_multiplier)) {
    body.loyalty_multiplier = data.loyalty_multiplier;
    body.loyaltyMultiplier = data.loyalty_multiplier;
  }
  if (data.notification_title) {
    body.notification_title = data.notification_title;
    body.notificationTitle = data.notification_title;
  }
  if (data.notification_body) {
    body.notification_body = data.notification_body;
    body.notificationBody = data.notification_body;
  }

  return body;
}

function mapCampaign(raw: Record<string, unknown>): Campaign {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    status: normalizeCampaignStatus(raw.status ?? raw.Status),
    start_date: String(raw.start_date ?? raw.startDate ?? ''),
    end_date: String(raw.end_date ?? raw.endDate ?? ''),
    user_segment: (raw.user_segment ?? raw.userSegment ?? 'all') as UserSegment,
    restaurant_id: raw.restaurant_id != null ? String(raw.restaurant_id) : undefined,
    banner_id: raw.banner_id != null ? String(raw.banner_id) : undefined,
    coupon_id: raw.coupon_id != null ? String(raw.coupon_id) : undefined,
    loyalty_bonus_points: raw.loyalty_bonus_points != null ? Number(raw.loyalty_bonus_points) : undefined,
    loyalty_multiplier: raw.loyalty_multiplier != null ? Number(raw.loyalty_multiplier) : undefined,
    notification_title: raw.notification_title != null ? String(raw.notification_title) : undefined,
    notification_body: raw.notification_body != null ? String(raw.notification_body) : undefined,
    notification_sent: Boolean(raw.notification_sent ?? raw.notificationSent ?? false),
    created_at: String(raw.created_at ?? raw.createdAt ?? ''),
  };
}

async function realGetCampaigns(params?: { status?: string }): Promise<Campaign[]> {
  const res = await apiClient.get('/admin/campaigns', { params });
  const list = extractListFromResponse(res.data, ['campaigns', 'items', 'results']);
  return list.map(mapCampaign);
}

async function realCreateCampaign(payload: Partial<Campaign>): Promise<Campaign> {
  const res = await apiClient.post('/admin/campaigns', buildCampaignApiPayload(payload));
  const raw = unwrap<Record<string, unknown>>(res.data) ?? (res.data as Record<string, unknown>);
  return mapCampaign(raw);
}

async function realUpdateCampaign(id: string, payload: Partial<Campaign>): Promise<Campaign> {
  const res = await apiClient.put(`/admin/campaigns/${id}`, buildCampaignApiPayload(payload));
  const raw = unwrap<Record<string, unknown>>(res.data) ?? (res.data as Record<string, unknown>);
  return mapCampaign(raw);
}

async function realSendCampaignNotification(campaign: Campaign): Promise<void> {
  const paths = [
    `/admin/campaigns/${campaign.id}/notify`,
    `/admin/campaigns/${campaign.id}/send-notification`,
  ];

  for (const path of paths) {
    try {
      await apiClient.post(path);
      return;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        continue;
      }
      throw err;
    }
  }

  const title = campaign.notification_title?.trim() || campaign.name;
  const body =
    campaign.notification_body?.trim() || campaign.description?.trim() || campaign.name;

  await apiClient.post('/admin/notifications/send-bulk', {
    title,
    body,
    topic: segmentToNotificationTopic(campaign.user_segment),
    data: buildCampaignNotificationData(campaign),
  });
}

export async function getCampaigns(params?: { status?: string }): Promise<Campaign[]> {
  try {
    return shouldUseMock() ? mockGetCampaigns(params) : realGetCampaigns(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function createCampaign(data: Partial<Campaign>): Promise<Campaign> {
  try {
    return shouldUseMock() ? mockCreateCampaign(data) : realCreateCampaign(data);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  try {
    return shouldUseMock() ? mockUpdateCampaign(id, data) : realUpdateCampaign(id, data);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function sendCampaignNotification(campaign: Campaign): Promise<void> {
  try {
    return shouldUseMock()
      ? mockSendCampaignNotification(campaign.id)
      : realSendCampaignNotification(campaign);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
