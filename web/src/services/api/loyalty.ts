/**
 * Loyalty API Service - Phase 3
 * إدارة نقاط الولاء حسب ADMIN_API_PHASE3.md
 */

import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

export interface LoyaltyAccount {
  id: string;
  userId: string;
  userName: string;
  email: string;
  currentBalance: number;
  lifetimeEarned: number;
  createdAt: string;
}

export interface LoyaltyAccountDetail {
  account: {
    current_balance: number;
    lifetime_earned: number;
    redeemable_value: number;
  };
  transactions: LoyaltyTransaction[];
  totalCount: number;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  order_id?: string;
  tx_type: 'earned' | 'redeemed' | 'expired' | 'adjustment';
  points: number;
  balance_after: number;
  description: string;
  expires_at?: string;
  created_at: string;
}

export interface LoyaltyStats {
  totalAccounts: number;
  totalPointsBalance: number;
  totalLifetimeEarned: number;
  totalPointsRedeemed: number;
}

export interface LoyaltyAccountsResponse {
  accounts: LoyaltyAccount[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function unwrap<T>(data: unknown): T {
  const d = data as { data?: T };
  return d?.data != null ? d.data : (data as T);
}

async function realGetLoyaltyAccounts(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<LoyaltyAccountsResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    search: params?.search,
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  };
  const cleaned = Object.fromEntries(
    Object.entries(queryParams).filter(([, v]) => v !== undefined && v !== '')
  );

  const res = await apiClient.get('/admin/loyalty/accounts', { params: cleaned });
  const raw = res.data as unknown;
  const body = (unwrap<Record<string, unknown>>(raw) ?? raw) as Record<string, unknown>;
  const accounts = (body?.accounts ?? body?.data ?? []) as LoyaltyAccount[];
  const pagination = body?.pagination as LoyaltyAccountsResponse['pagination'] | undefined;
  return {
    accounts: Array.isArray(accounts) ? accounts : [],
    pagination:
      pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
}

async function realGetLoyaltyAccountDetail(userId: string): Promise<LoyaltyAccountDetail> {
  const res = await apiClient.get(`/admin/loyalty/accounts/${userId}`);
  return unwrap<LoyaltyAccountDetail>(res.data);
}

async function realGetLoyaltyStats(): Promise<LoyaltyStats> {
  const res = await apiClient.get('/admin/loyalty/stats');
  return unwrap<LoyaltyStats>(res.data);
}

async function realAdjustLoyaltyPoints(payload: {
  user_id: string;
  points: number;
  description: string;
}): Promise<void> {
  await apiClient.post('/admin/loyalty/adjust', payload);
}

// Mock
const mockAccounts: LoyaltyAccount[] = [
  {
    id: 'la1',
    userId: 'u1',
    userName: 'أحمد محمد',
    email: 'ahmed@example.com',
    currentBalance: 500,
    lifetimeEarned: 1200,
    createdAt: '2026-01-15T10:30:00Z',
  },
];

export async function mockGetLoyaltyAccounts(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<LoyaltyAccountsResponse> {
  await new Promise((r) => setTimeout(r, 300));
  let result = [...mockAccounts];
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.userName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
    );
  }
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  return {
    accounts: result.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: result.length,
      totalPages: Math.ceil(result.length / limit),
    },
  };
}

export async function mockGetLoyaltyAccountDetail(userId: string): Promise<LoyaltyAccountDetail> {
  await new Promise((r) => setTimeout(r, 200));
  const acc = mockAccounts.find((a) => a.userId === userId);
  if (!acc) throw new Error('الحساب غير موجود');
  return {
    account: {
      current_balance: acc.currentBalance,
      lifetime_earned: acc.lifetimeEarned,
      redeemable_value: acc.currentBalance * 0.1,
    },
    transactions: [
      {
        id: 'tx1',
        user_id: userId,
        order_id: 'ord1',
        tx_type: 'earned',
        points: 50,
        balance_after: 500,
        description: 'Earned 50 points from order',
        created_at: '2026-03-15T10:30:00Z',
      },
    ],
    totalCount: 1,
  };
}

export async function mockGetLoyaltyStats(): Promise<LoyaltyStats> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    totalAccounts: mockAccounts.length,
    totalPointsBalance: 500,
    totalLifetimeEarned: 1200,
    totalPointsRedeemed: 700,
  };
}

export async function mockAdjustLoyaltyPoints(payload: {
  user_id: string;
  points: number;
  description: string;
}): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const acc = mockAccounts.find((a) => a.userId === payload.user_id);
  if (!acc) throw new Error('الحساب غير موجود');
  acc.currentBalance += payload.points;
}

export type GetLoyaltyAccountsParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export async function getLoyaltyAccounts(params?: GetLoyaltyAccountsParams): Promise<LoyaltyAccountsResponse> {
  try {
    return shouldUseMock() ? mockGetLoyaltyAccounts(params) : realGetLoyaltyAccounts(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getLoyaltyAccountDetail(userId: string): Promise<LoyaltyAccountDetail> {
  try {
    return shouldUseMock() ? mockGetLoyaltyAccountDetail(userId) : realGetLoyaltyAccountDetail(userId);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getLoyaltyStats(): Promise<LoyaltyStats> {
  try {
    return shouldUseMock() ? mockGetLoyaltyStats() : realGetLoyaltyStats();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function adjustLoyaltyPoints(payload: {
  user_id: string;
  points: number;
  description: string;
}): Promise<void> {
  try {
    return shouldUseMock()
      ? mockAdjustLoyaltyPoints(payload)
      : realAdjustLoyaltyPoints(payload);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
