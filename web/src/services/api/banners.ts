/**
 * Banners API Service
 * إدارة البانرات — Handoff §10
 */

import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

export type BannerType = 'restaurant_promo' | 'platform_offer' | 'campaign' | 'custom';
export type UserSegment = 'new_user' | 'loyal_user' | 'all';

export interface Banner {
  id: string;
  title: string;
  description: string;
  banner_type: BannerType;
  image_url: string;
  action_url?: string;
  restaurant_id?: string;
  priority: number;
  user_segment: UserSegment;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
}

const BANNER_TYPE_LABELS: Record<BannerType, string> = {
  restaurant_promo: 'عرض مطعم',
  platform_offer: 'عرض المنصة',
  campaign: 'حملة',
  custom: 'مخصص',
};

const USER_SEGMENT_LABELS: Record<UserSegment, string> = {
  new_user: 'مستخدم جديد',
  loyal_user: 'عميل مخلص',
  all: 'الكل',
};

// Mock data
const mockBanners: Banner[] = [
  {
    id: '1',
    title: 'خصم 50%',
    description: 'على أول طلب',
    banner_type: 'platform_offer',
    image_url: 'https://via.placeholder.com/400x150?text=Banner+1',
    action_url: 'souq://promo/first-order',
    priority: 10,
    user_segment: 'new_user',
    is_active: true,
    start_date: '2026-02-01T00:00:00Z',
    end_date: '2026-03-01T00:00:00Z',
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'عرض المطاعم المميزة',
    description: 'توصيل مجاني للطلبات فوق 100 ج.م',
    banner_type: 'restaurant_promo',
    image_url: 'https://via.placeholder.com/400x150?text=Banner+2',
    restaurant_id: 'r1',
    priority: 8,
    user_segment: 'all',
    is_active: true,
    start_date: '2026-02-15T00:00:00Z',
    end_date: '2026-03-15T00:00:00Z',
    created_at: '2026-02-15T10:00:00Z',
  },
];

export const getBannerTypeLabel = (type: BannerType) => BANNER_TYPE_LABELS[type] || type;
export const getUserSegmentLabel = (seg: UserSegment) => USER_SEGMENT_LABELS[seg] || seg;

export async function mockGetBanners(params?: {
  is_active?: boolean;
  banner_type?: BannerType;
}): Promise<Banner[]> {
  await new Promise((r) => setTimeout(r, 300));
  let result = [...mockBanners];
  if (params?.is_active !== undefined) {
    result = result.filter((b) => b.is_active === params.is_active);
  }
  if (params?.banner_type) {
    result = result.filter((b) => b.banner_type === params.banner_type);
  }
  return result;
}

export async function mockCreateBanner(data: Partial<Banner>): Promise<Banner> {
  await new Promise((r) => setTimeout(r, 300));
  const banner: Banner = {
    id: `b${Date.now()}`,
    title: data.title || '',
    description: data.description || '',
    banner_type: (data.banner_type as BannerType) || 'custom',
    image_url: data.image_url || '',
    action_url: data.action_url,
    restaurant_id: data.restaurant_id,
    priority: data.priority ?? 0,
    user_segment: (data.user_segment as UserSegment) || 'all',
    is_active: data.is_active ?? true,
    start_date: data.start_date || new Date().toISOString(),
    end_date: data.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  };
  mockBanners.push(banner);
  return banner;
}

export async function mockUpdateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockBanners.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error('البانر غير موجود');
  mockBanners[idx] = { ...mockBanners[idx], ...data };
  return mockBanners[idx];
}

export async function mockDeleteBanner(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockBanners.findIndex((b) => b.id === id);
  if (idx !== -1) mockBanners.splice(idx, 1);
}

function mapBanner(raw: Record<string, unknown>): Banner {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    banner_type: (raw.banner_type ?? raw.bannerType ?? 'custom') as BannerType,
    image_url: String(raw.image_url ?? raw.imageUrl ?? ''),
    action_url: raw.action_url != null ? String(raw.action_url) : undefined,
    restaurant_id: raw.restaurant_id != null ? String(raw.restaurant_id) : undefined,
    priority: Number(raw.priority ?? 0),
    user_segment: (raw.user_segment ?? raw.userSegment ?? 'all') as UserSegment,
    is_active: Boolean(raw.is_active ?? raw.isActive ?? true),
    start_date: String(raw.start_date ?? raw.startDate ?? ''),
    end_date: String(raw.end_date ?? raw.endDate ?? ''),
    created_at: String(raw.created_at ?? raw.createdAt ?? ''),
  };
}

async function realGetBanners(params?: {
  is_active?: boolean;
  banner_type?: BannerType;
}): Promise<Banner[]> {
  const { data } = await apiClient.get<{ banners?: unknown[] }>('/admin/banners', { params });
  const list = data.banners ?? (Array.isArray(data) ? data : []);
  return (list as Record<string, unknown>[]).map(mapBanner);
}

async function realCreateBanner(payload: Partial<Banner>): Promise<Banner> {
  const { data } = await apiClient.post('/admin/banners', payload);
  return mapBanner((data as { data?: Record<string, unknown> }).data ?? (data as Record<string, unknown>));
}

async function realUpdateBanner(id: string, payload: Partial<Banner>): Promise<Banner> {
  const { data } = await apiClient.put(`/admin/banners/${id}`, payload);
  return mapBanner((data as { data?: Record<string, unknown> }).data ?? (data as Record<string, unknown>));
}

async function realDeleteBanner(id: string): Promise<void> {
  await apiClient.delete(`/admin/banners/${id}`);
}

export async function getBanners(params?: {
  is_active?: boolean;
  banner_type?: BannerType;
}): Promise<Banner[]> {
  try {
    return shouldUseMock() ? mockGetBanners(params) : realGetBanners(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function createBanner(data: Partial<Banner>): Promise<Banner> {
  try {
    return shouldUseMock() ? mockCreateBanner(data) : realCreateBanner(data);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
  try {
    return shouldUseMock() ? mockUpdateBanner(id, data) : realUpdateBanner(id, data);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function deleteBanner(id: string): Promise<void> {
  try {
    return shouldUseMock() ? mockDeleteBanner(id) : realDeleteBanner(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
