/**
 * Campaigns API Service — Handoff §11
 */

import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

export type UserSegment = 'new_user' | 'loyal_user' | 'all';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'expired';
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

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  expired: 'منتهي',
};

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

export const getCampaignStatusLabel = (status: string) => STATUS_LABELS[status] || status;
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

function mapCampaign(raw: Record<string, unknown>): Campaign {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    status: (raw.status ?? 'active') as Campaign['status'],
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
  const { data } = await apiClient.get<{ campaigns?: unknown[] }>('/admin/campaigns', { params });
  const list = data.campaigns ?? (Array.isArray(data) ? data : []);
  return (list as Record<string, unknown>[]).map(mapCampaign);
}

async function realCreateCampaign(payload: Partial<Campaign>): Promise<Campaign> {
  const { data } = await apiClient.post('/admin/campaigns', payload);
  return mapCampaign((data as { data?: Record<string, unknown> }).data ?? (data as Record<string, unknown>));
}

async function realUpdateCampaign(id: string, payload: Partial<Campaign>): Promise<Campaign> {
  const { data } = await apiClient.put(`/admin/campaigns/${id}`, payload);
  return mapCampaign((data as { data?: Record<string, unknown> }).data ?? (data as Record<string, unknown>));
}

async function realSendCampaignNotification(id: string): Promise<void> {
  await apiClient.post(`/admin/campaigns/${id}/send-notification`);
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

export async function sendCampaignNotification(id: string): Promise<void> {
  try {
    return shouldUseMock() ? mockSendCampaignNotification(id) : realSendCampaignNotification(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
