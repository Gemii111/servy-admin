/**
 * Riders API Service
 * إدارة السائقين حسب ADMIN_APPLICATION_REQUIREMENTS.md
 */

export interface Rider {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  is_approved: boolean;
  total_orders: number;
  total_earnings: number;
  rating: number;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  pending: 'معلق',
};

// Mock data
const mockRiders: Rider[] = [
  {
    id: '1',
    user_id: 'u1',
    first_name: 'أحمد',
    last_name: 'محمد',
    email: 'ahmed@example.com',
    phone: '+201012345678',
    status: 'active',
    is_approved: true,
    total_orders: 250,
    total_earnings: 5000,
    rating: 4.8,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'u2',
    first_name: 'خالد',
    last_name: 'علي',
    email: 'khaled@example.com',
    phone: '+201098765432',
    status: 'active',
    is_approved: true,
    total_orders: 180,
    total_earnings: 3600,
    rating: 4.5,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: '3',
    user_id: 'u3',
    first_name: 'محمود',
    last_name: 'حسن',
    email: 'mahmoud@example.com',
    phone: '+201055555555',
    status: 'pending',
    is_approved: false,
    total_orders: 0,
    total_earnings: 0,
    rating: 0,
    created_at: '2026-03-01T10:00:00Z',
  },
];

export const getRiderStatusLabel = (status: string) => STATUS_LABELS[status] || status;

export async function mockGetRiders(params?: {
  status?: string;
  search?: string;
}): Promise<Rider[]> {
  await new Promise((r) => setTimeout(r, 300));
  let result = [...mockRiders];
  if (params?.status && params.status !== 'all') {
    result = result.filter((r) => r.status === params.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.first_name.toLowerCase().includes(q) ||
        r.last_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q)
    );
  }
  return result;
}

export async function mockGetRiderById(id: string): Promise<Rider | null> {
  await new Promise((r) => setTimeout(r, 200));
  return mockRiders.find((r) => r.id === id) || null;
}

export async function mockUpdateRiderStatus(
  id: string,
  status: 'active' | 'inactive'
): Promise<Rider> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockRiders.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('السائق غير موجود');
  mockRiders[idx].status = status;
  return mockRiders[idx];
}

export async function mockApproveRider(id: string): Promise<Rider> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockRiders.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('السائق غير موجود');
  mockRiders[idx].is_approved = true;
  mockRiders[idx].status = 'active';
  return mockRiders[idx];
}

export async function mockRejectRider(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockRiders.findIndex((r) => r.id === id);
  if (idx !== -1) mockRiders.splice(idx, 1);
}

// DriverEarningsModel حسب المواصفات
export interface RiderEarnings {
  today_earnings: number;
  week_earnings: number;
  month_earnings: number;
  total_earnings: number;
  today_deliveries: number;
  week_deliveries: number;
  month_deliveries: number;
  total_deliveries: number;
  average_earning_per_delivery: number;
}

export async function mockGetRiderEarnings(id: string): Promise<RiderEarnings | null> {
  await new Promise((r) => setTimeout(r, 200));
  const rider = mockRiders.find((r) => r.id === id);
  if (!rider) return null;
  return {
    today_earnings: Math.floor(rider.total_earnings * 0.05),
    week_earnings: Math.floor(rider.total_earnings * 0.2),
    month_earnings: Math.floor(rider.total_earnings * 0.5),
    total_earnings: rider.total_earnings,
    today_deliveries: Math.floor(rider.total_orders * 0.03),
    week_deliveries: Math.floor(rider.total_orders * 0.15),
    month_deliveries: Math.floor(rider.total_orders * 0.4),
    total_deliveries: rider.total_orders,
    average_earning_per_delivery:
      rider.total_orders > 0 ? rider.total_earnings / rider.total_orders : 0,
  };
}

// DriverRatingModel حسب المواصفات
export interface RiderReview {
  id: string;
  user_id: string;
  user_name: string;
  driver_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export async function mockGetRiderReviews(id: string): Promise<RiderReview[]> {
  await new Promise((r) => setTimeout(r, 200));
  const rider = mockRiders.find((r) => r.id === id);
  if (!rider || rider.total_orders === 0) return [];
  return [
    {
      id: 'rev1',
      user_id: 'u1',
      user_name: 'عميل 1',
      driver_id: id,
      order_id: 'ord1',
      rating: 5,
      comment: 'توصيل سريع ومنظم',
      created_at: '2026-02-15T10:00:00Z',
    },
    {
      id: 'rev2',
      user_id: 'u2',
      user_name: 'عميل 2',
      driver_id: id,
      order_id: 'ord2',
      rating: 4,
      comment: 'جيد جداً',
      created_at: '2026-02-20T14:00:00Z',
    },
  ];
}
