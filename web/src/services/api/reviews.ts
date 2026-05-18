/**
 * Reviews API Service - Phase 3
 * إدارة التقييمات حسب ADMIN_API_PHASE3.md
 */

import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock, cleanListQueryParams } from './base';

export type ReviewTargetType = 'restaurant' | 'rider' | 'all';

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;
  rating: number;
  comment: string;
  createdAt: string;
  hidden?: boolean;
}

function mapReview(raw: Record<string, unknown>): Review {
  return {
    id: String(raw.id ?? ''),
    orderId: String(raw.orderId ?? raw.order_id ?? ''),
    userId: String(raw.userId ?? raw.user_id ?? ''),
    userName: String(raw.userName ?? raw.user_name ?? ''),
    targetType: (raw.targetType ?? raw.target_type ?? 'restaurant') as ReviewTargetType,
    targetId: String(raw.targetId ?? raw.target_id ?? ''),
    targetName: String(raw.targetName ?? raw.target_name ?? ''),
    rating: Number(raw.rating ?? 0),
    comment: String(raw.comment ?? ''),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    hidden: Boolean(raw.hidden ?? false),
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function unwrap<T>(data: unknown): T {
  const d = data as { data?: T };
  return d?.data != null ? d.data : (data as T);
}

async function realGetReviews(params?: {
  targetType?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ReviewsResponse> {
  const cleaned = cleanListQueryParams({
    target_type: params?.targetType,
    rating: params?.rating,
    search: params?.search,
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  });

  const res = await apiClient.get('/admin/reviews', { params: cleaned });
  const raw = res.data as unknown;
  const body = (unwrap<Record<string, unknown>>(raw) ?? raw) as Record<string, unknown>;
  const rawReviews = (body?.reviews ?? body?.data ?? []) as Record<string, unknown>[];
  const pagination = body?.pagination as ReviewsResponse['pagination'] | undefined;
  return {
    reviews: Array.isArray(rawReviews) ? rawReviews.map(mapReview) : [],
    pagination:
      pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
  };
}

async function realDeleteReview(id: string): Promise<void> {
  await apiClient.delete(`/admin/reviews/${id}`);
}

async function realSetReviewHidden(id: string, hidden: boolean): Promise<void> {
  await apiClient.put(`/admin/reviews/${id}/hide`, { hidden });
}

// Mock
const mockReviews: Review[] = [
  {
    id: 'rv1',
    orderId: 'ord1',
    userId: 'u1',
    userName: 'عميل 1',
    targetType: 'restaurant',
    targetId: 'r1',
    targetName: 'بيتزا هت',
    rating: 5,
    comment: 'طعام ممتاز!',
    createdAt: '2026-03-01T14:30:00Z',
  },
  {
    id: 'rv2',
    orderId: 'ord2',
    userId: 'u2',
    userName: 'عميل 2',
    targetType: 'rider',
    targetId: 'r2',
    targetName: 'أحمد محمد',
    rating: 4,
    comment: 'توصيل سريع',
    createdAt: '2026-03-02T10:00:00Z',
    hidden: false,
  },
];

async function mockSetReviewHidden(id: string, hidden: boolean): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  const review = mockReviews.find((r) => r.id === id);
  if (review) review.hidden = hidden;
}

export async function mockGetReviews(params?: {
  targetType?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ReviewsResponse> {
  await new Promise((r) => setTimeout(r, 300));
  let result = [...mockReviews];
  if (params?.targetType && params.targetType !== 'all') {
    result = result.filter((r) => r.targetType === params.targetType);
  }
  if (params?.rating && params.rating > 0) {
    result = result.filter((r) => r.rating === params.rating);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.userName.toLowerCase().includes(q) ||
        (r.comment && r.comment.toLowerCase().includes(q)) ||
        r.targetName.toLowerCase().includes(q)
    );
  }
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  return {
    reviews: result.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: result.length,
      totalPages: Math.ceil(result.length / limit),
    },
  };
}

export async function mockDeleteReview(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockReviews.findIndex((r) => r.id === id);
  if (idx !== -1) mockReviews.splice(idx, 1);
}

export type GetReviewsParams = {
  targetType?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
};

export async function getReviews(params?: GetReviewsParams): Promise<ReviewsResponse> {
  try {
    return shouldUseMock() ? mockGetReviews(params) : realGetReviews(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    return shouldUseMock() ? mockDeleteReview(id) : realDeleteReview(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function setReviewHidden(id: string, hidden: boolean): Promise<void> {
  try {
    return shouldUseMock() ? mockSetReviewHidden(id, hidden) : realSetReviewHidden(id, hidden);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
