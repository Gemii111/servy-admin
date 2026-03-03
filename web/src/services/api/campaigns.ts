/**
 * Campaigns API Service
 * إدارة الحملات حسب ADMIN_APPLICATION_REQUIREMENTS.md
 */

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
