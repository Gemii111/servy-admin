import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

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

interface ApiCoupon {
  id: string;
  code: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count?: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
}

function unwrap<T>(data: unknown): T {
  const d = data as { data?: T };
  return d?.data != null ? d.data : (data as T);
}

function mapApiCouponToCoupon(c: ApiCoupon): Coupon {
  const type: CouponType = c.discount_type === 'fixed_amount' ? 'fixed' : 'percentage';
  const now = new Date().toISOString();
  let status: CouponStatus = c.is_active ? 'active' : 'disabled';
  if (c.valid_until && new Date(c.valid_until) < new Date()) status = 'expired';
  return {
    id: c.id,
    code: c.code,
    description: c.description,
    type,
    value: c.discount_value,
    maxDiscount: c.max_discount,
    minOrderAmount: c.min_order_amount,
    usageLimit: c.usage_limit,
    usedCount: c.usage_count ?? 0,
    startDate: c.valid_from,
    endDate: c.valid_until,
    status,
    createdAt: c.valid_from,
    updatedAt: now,
  };
}

async function realGetCoupons(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<CouponsResponse> {
  const res = await apiClient.get<{ coupons?: ApiCoupon[]; pagination: CouponsResponse['pagination'] }>(
    '/admin/coupons',
    { params }
  );
  const body = unwrap<{ coupons?: ApiCoupon[]; pagination: CouponsResponse['pagination'] }>(res.data) ?? res.data;
  const list = body.coupons ?? [];
  return {
    coupons: list.map(mapApiCouponToCoupon),
    pagination: body.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
}

async function realGetCouponById(id: string): Promise<Coupon> {
  const res = await apiClient.get<ApiCoupon>(`/admin/coupons/${id}`);
  const data = unwrap<ApiCoupon>(res.data) ?? res.data;
  return mapApiCouponToCoupon(data);
}

async function realCreateCoupon(payload: {
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
  const res = await apiClient.post<ApiCoupon>('/admin/coupons', {
    code: payload.code,
    description: payload.description,
    discount_type: payload.type === 'fixed' ? 'fixed_amount' : 'percentage',
    discount_value: payload.value,
    min_order_amount: payload.minOrderAmount,
    max_discount: payload.maxDiscount,
    usage_limit: payload.usageLimit,
    valid_from: payload.startDate,
    valid_until: payload.endDate,
    is_active: payload.status === 'active',
  });
  const data = unwrap<ApiCoupon>(res.data) ?? res.data;
  return mapApiCouponToCoupon(data);
}

async function realUpdateCoupon(
  id: string,
  payload: Partial<Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>>
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (payload.value !== undefined) body.discount_value = payload.value;
  if (payload.minOrderAmount !== undefined) body.min_order_amount = payload.minOrderAmount;
  if (payload.maxDiscount !== undefined) body.max_discount = payload.maxDiscount;
  if (payload.usageLimit !== undefined) body.usage_limit = payload.usageLimit;
  if (payload.startDate !== undefined) body.valid_from = payload.startDate;
  if (payload.endDate !== undefined) body.valid_until = payload.endDate;
  if (payload.status !== undefined) body.is_active = payload.status === 'active';
  await apiClient.put(`/admin/coupons/${id}`, body);
}

async function realDeleteCoupon(id: string): Promise<void> {
  await apiClient.delete(`/admin/coupons/${id}`);
}

async function realToggleCouponStatus(id: string): Promise<void> {
  await apiClient.put(`/admin/coupons/${id}/toggle`);
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

// ——— Unified API (mock vs real) ———

export type GetCouponsParams = {
  status?: CouponStatus | 'all';
  type?: CouponType | 'all';
  search?: string;
  page?: number;
  limit?: number;
};

export async function getCoupons(params?: GetCouponsParams): Promise<CouponsResponse> {
  try {
    return shouldUseMock() ? mockGetCoupons(params) : realGetCoupons(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getCouponById(id: string): Promise<Coupon> {
  try {
    if (shouldUseMock()) {
      const list = await mockGetCoupons({ limit: 1000 });
      const c = list.coupons.find((x) => x.id === id);
      if (!c) throw new Error('Coupon not found');
      return c;
    }
    return realGetCouponById(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function createCoupon(payload: {
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
  try {
    return shouldUseMock() ? mockCreateCoupon(payload) : realCreateCoupon(payload);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateCoupon(
  id: string,
  payload: Partial<Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>>
): Promise<Coupon> {
  try {
    if (shouldUseMock()) return mockUpdateCoupon(id, payload);
    await realUpdateCoupon(id, payload);
    return realGetCouponById(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  try {
    return shouldUseMock() ? mockDeleteCoupon(id) : realDeleteCoupon(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function toggleCouponStatus(id: string): Promise<Coupon> {
  try {
    if (shouldUseMock()) return mockToggleCouponStatus(id);
    await realToggleCouponStatus(id);
    return realGetCouponById(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

