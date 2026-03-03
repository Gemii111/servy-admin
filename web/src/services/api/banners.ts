/**
 * Banners API Service
 * إدارة البانرات حسب ADMIN_APPLICATION_REQUIREMENTS.md
 */

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
