export type CouponType = 'percentage' | 'fixed';
export type CouponStatus = 'active' | 'scheduled' | 'expired' | 'disabled';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate?: string;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CouponsResponse {
  coupons: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Mock coupons data
let mockCoupons: Coupon[] = Array.from({ length: 25 }, (_, i) => {
  const types: CouponType[] = ['percentage', 'fixed'];
  const statuses: CouponStatus[] = ['active', 'scheduled', 'expired', 'disabled'];

  const type = types[i % types.length];
  const status = statuses[i % statuses.length];

  const now = Date.now();
  const startOffset = Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000;
  const endOffset = Math.floor(Math.random() * 30 + 7) * 24 * 60 * 60 * 1000;

  const startDate = new Date(now - startOffset).toISOString();
  const endDate = status === 'expired' ? new Date(now - 24 * 60 * 60 * 1000).toISOString() : new Date(now + endOffset).toISOString();

  return {
    id: `coupon-${i + 1}`,
    code: `SERVY${String(i + 1).padStart(3, '0')}`,
    description: `كوبون خصم رقم ${i + 1}`,
    type,
    value: type === 'percentage' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 40) + 10,
    maxDiscount: type === 'percentage' ? Math.floor(Math.random() * 80) + 20 : undefined,
    minOrderAmount: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 50 : undefined,
    usageLimit: Math.random() > 0.5 ? Math.floor(Math.random() * 200) + 50 : undefined,
    usedCount: Math.floor(Math.random() * 100),
    startDate,
    endDate,
    status,
    createdAt: startDate,
    updatedAt: new Date().toISOString(),
  };
});

export async function mockGetCoupons(params?: {
  status?: CouponStatus | 'all';
  type?: CouponType | 'all';
  search?: string;
  page?: number;
  limit?: number;
}): Promise<CouponsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  let filtered = [...mockCoupons];

  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((c) => c.status === params.status);
  }

  if (params?.type && params.type !== 'all') {
    filtered = filtered.filter((c) => c.type === params.type);
  }

  if (params?.search) {
    const query = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        (c.description || '').toLowerCase().includes(query)
    );
  }

  // Sort by createdAt (newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    coupons: filtered.slice(start, end),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function mockCreateCoupon(payload: {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  startDate: string;
  endDate?: string;
  status: CouponStatus;
}): Promise<Coupon> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const now = new Date().toISOString();
  const newCoupon: Coupon = {
    id: `coupon-${mockCoupons.length + 1}`,
    code: payload.code,
    description: payload.description,
    type: payload.type,
    value: payload.value,
    maxDiscount: payload.maxDiscount,
    minOrderAmount: payload.minOrderAmount,
    usageLimit: payload.usageLimit,
    usedCount: 0,
    startDate: payload.startDate,
    endDate: payload.endDate,
    status: payload.status,
    createdAt: now,
    updatedAt: now,
  };

  mockCoupons = [newCoupon, ...mockCoupons];
  return newCoupon;
}

export async function mockUpdateCoupon(
  id: string,
  payload: Partial<Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>>
): Promise<Coupon> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockCoupons.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Coupon not found');
  }

  const updated: Coupon = {
    ...mockCoupons[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  mockCoupons[index] = updated;
  return updated;
}

export async function mockDeleteCoupon(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockCoupons = mockCoupons.filter((c) => c.id !== id);
}

export async function mockToggleCouponStatus(id: string): Promise<Coupon> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockCoupons.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Coupon not found');
  }

  let nextStatus: CouponStatus;
  const current = mockCoupons[index].status;
  if (current === 'disabled') {
    nextStatus = 'active';
  } else if (current === 'active') {
    nextStatus = 'disabled';
  } else {
    nextStatus = current;
  }

  const updated: Coupon = {
    ...mockCoupons[index],
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };

  mockCoupons[index] = updated;
  return updated;
}


