/**
 * Reviews API Service - Phase 3
 * إدارة التقييمات حسب ADMIN_API_PHASE3.md
 */

import axios from 'axios';
import apiClient from './client';
import { handleApiError } from './client';
import {
  shouldUseMock,
  cleanListQueryParams,
  extractListFromResponse,
  unwrap,
} from './base';

export type ReviewTargetType = 'restaurant' | 'rider' | 'all';

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;
  rating: number;
  comment: string;
  createdAt: string;
  hidden?: boolean;
}

function pickString(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = raw[k];
    if (v != null && v !== '') return String(v);
  }
  return '';
}

function normalizeTargetType(raw: string): ReviewTargetType {
  const t = raw.toLowerCase();
  if (t === 'rider' || t === 'driver' || t === 'delivery') return 'rider';
  if (t === 'restaurant' || t === 'vendor' || t === 'store' || t === 'merchant') {
    return 'restaurant';
  }
  return 'restaurant';
}

export function mapReviewFromRaw(raw: Record<string, unknown>): Review {
  const targetTypeRaw = pickString(raw, 'targetType', 'target_type', 'type', 'review_type');
  const targetType = normalizeTargetType(targetTypeRaw || 'restaurant');

  const targetName =
    pickString(
      raw,
      'targetName',
      'target_name',
      'restaurant_name',
      'restaurantName',
      'rider_name',
      'riderName',
      'driver_name',
      'store_name'
    ) || '—';

  return {
    id: pickString(raw, 'id', 'review_id', 'reviewId'),
    orderId: pickString(raw, 'orderId', 'order_id'),
    userId: pickString(raw, 'userId', 'user_id', 'customer_id', 'customerId'),
    userName:
      pickString(
        raw,
        'userName',
        'user_name',
        'customer_name',
        'customerName',
        'reviewer_name',
        'reviewerName'
      ) || '—',
    userImage:
      raw.user_image === null || raw.userImage === null
        ? null
        : pickString(raw, 'user_image', 'userImage', 'user_image_url', 'avatar') ?? null,
    targetType,
    targetId: pickString(raw, 'targetId', 'target_id', 'restaurant_id', 'rider_id', 'driver_id'),
    targetName,
    rating: Number(raw.rating ?? raw.stars ?? raw.score ?? 0),
    comment: pickString(raw, 'comment', 'review', 'text', 'body'),
    createdAt: pickString(raw, 'createdAt', 'created_at', 'CreatedAt'),
    hidden: Boolean(raw.hidden ?? raw.is_hidden ?? raw.isHidden ?? false),
  };
}

export type ReviewsDataSource =
  | 'admin/reviews'
  | 'admin/driver-ratings'
  | 'admin/riders/:id/reviews'
  | 'restaurants/reviews'
  | 'riders/reviews';

export interface ReviewsResponse {
  reviews: Review[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  /** مصدر القائمة — عند fallback يكون driver-ratings لأن /admin/reviews معطّل */
  dataSource?: ReviewsDataSource;
  /** رسالة للواجهة عند استخدام بديل أو فشل جزئي */
  notice?: string;
  /** قائمة التقييمات غير متاحة من السيرفر (500/404) — لا تعيد رمي خطأ للواجهة */
  apiUnavailable?: boolean;
}

const REVIEWS_UNAVAILABLE_MSG =
  'GET /admin/reviews لا يزال يعيد خطأ. الباكند أعلن إصلاح SQL (2026-05-21) — جرّب «إعادة المحاولة». للتقييمات حسب مطعم/سائق: افتح تفاصيل الكيان. راجع flutter-reviews-api.md و BACKEND_REVIEWS_500_AR.md';

let reviewsListCachedUnavailable = false;

/** إعادة محاولة بعد deploy الباكند */
export function clearReviewsUnavailableCache(): void {
  reviewsListCachedUnavailable = false;
}

function mapDriverRatingToReview(raw: Record<string, unknown>): Review {
  const driver =
    raw.driver && typeof raw.driver === 'object'
      ? (raw.driver as Record<string, unknown>)
      : {};
  const customer =
    raw.customer && typeof raw.customer === 'object'
      ? (raw.customer as Record<string, unknown>)
      : {};

  return {
    id: pickString(raw, 'id'),
    orderId: pickString(raw, 'orderId', 'order_id'),
    userId: pickString(raw, 'customerId', 'customer_id', 'userId', 'user_id') || pickString(customer, 'id'),
    userName:
      pickString(customer, 'name') ||
      pickString(raw, 'customer_name', 'customerName', 'user_name', 'userName') ||
      '—',
    targetType: 'rider',
    targetId: pickString(raw, 'driverId', 'driver_id', 'target_id', 'targetId') || pickString(driver, 'id'),
    targetName: pickString(driver, 'name') || pickString(raw, 'driver_name', 'driverName') || '—',
    rating: Number(raw.rating ?? 0),
    comment: pickString(raw, 'comment'),
    createdAt: pickString(raw, 'createdAt', 'created_at'),
    hidden: Boolean(raw.isHidden ?? raw.is_hidden ?? raw.hidden ?? false),
  };
}

function formatResponseData(data: unknown): string {
  if (data == null) return '';
  if (typeof data === 'string') return data.slice(0, 200);
  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    for (const key of ['message', 'error', 'detail', 'msg']) {
      const v = o[key];
      if (typeof v === 'string' && v.trim()) return v;
    }
    try {
      return JSON.stringify(data).slice(0, 300);
    } catch {
      return String(data);
    }
  }
  return String(data).slice(0, 200);
}

function extractApiErrorDetail(err: unknown): string | undefined {
  if (!axios.isAxiosError(err)) return undefined;
  const formatted = formatResponseData(err.response?.data);
  return formatted || undefined;
}

function emptyReviewsResponse(notice: string): ReviewsResponse {
  return {
    reviews: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    notice,
    apiUnavailable: true,
  };
}

/** بعد أول فشل كامل لـ /admin/reviews — تجنب إعادة الطلبات عند كل focus */
export function isReviewsListUnavailable(): boolean {
  return reviewsListCachedUnavailable;
}

function extractPagination(
  data: unknown,
  fallbackTotal: number
): ReviewsResponse['pagination'] {
  const roots: Record<string, unknown>[] = [];
  if (data && typeof data === 'object') roots.push(data as Record<string, unknown>);
  const inner = unwrap<Record<string, unknown>>(data);
  if (inner && typeof inner === 'object') roots.push(inner);

  for (const root of roots) {
    const pag = root.pagination as ReviewsResponse['pagination'] | undefined;
    if (pag && typeof pag === 'object') return pag;
    const total = root.total_count ?? root.totalCount;
    const page = root.page;
    const pageSize = root.page_size ?? root.pageSize ?? root.limit;
    if (total != null && page != null) {
      const limit = Number(pageSize ?? 10);
      const totalN = Number(total);
      return {
        page: Number(page),
        limit,
        total: totalN,
        totalPages: Math.max(1, Math.ceil(totalN / limit)),
      };
    }
  }

  return {
    page: 1,
    limit: 10,
    total: fallbackTotal,
    totalPages: Math.max(1, Math.ceil(fallbackTotal / 10)),
  };
}

function parseReviewsResponse(data: unknown): ReviewsResponse {
  const rawList = extractListFromResponse(data, ['reviews', 'items', 'results', 'data']);
  const reviews = rawList.map((r) => mapReviewFromRaw(r));

  if (process.env.NODE_ENV === 'development') {
    console.log('[Reviews API] عدد التقييمات:', reviews.length);
    if (reviews.length > 0) console.log('[Reviews API] عينة:', rawList[0]);
    else console.log('[Reviews API] استجابة خام:', data);
  }

  return {
    reviews,
    pagination: extractPagination(data, reviews.length),
    dataSource: 'admin/reviews',
  };
}

async function fetchReviewsFromApi(
  query: Record<string, string | number>
): Promise<ReviewsResponse> {
  const res = await apiClient.get('/admin/reviews', { params: query });
  return parseReviewsResponse(res.data);
}

function filterByTargetId(reviews: Review[], targetId?: string): Review[] {
  if (!targetId) return reviews;
  return reviews.filter((r) => r.targetId === targetId);
}

function applySearchFilter(reviews: Review[], search?: string): Review[] {
  if (!search?.trim()) return reviews;
  const q = search.trim().toLowerCase();
  return reviews.filter(
    (r) =>
      r.userName.toLowerCase().includes(q) ||
      r.targetName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q)
  );
}

function parseCustomerReviewsList(
  data: unknown,
  source: 'restaurants/reviews' | 'riders/reviews'
): ReviewsResponse {
  const inner = unwrap<Record<string, unknown>>(data);
  const rawList = extractListFromResponse(inner ?? data, ['reviews']);
  const reviews = rawList.map((r) => mapReviewFromRaw(r));
  const root = (inner && typeof inner === 'object' ? inner : data) as Record<string, unknown>;
  const total = Number(root.total_count ?? root.totalCount ?? reviews.length);
  const page = Number(root.page ?? 1);
  const pageSize = Number(root.page_size ?? root.pageSize ?? root.limit ?? 10);

  return {
    reviews,
    pagination: {
      page,
      limit: pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    dataSource: source,
    notice:
      source === 'restaurants/reviews'
        ? 'من GET /restaurants/{id}/reviews (API التطبيق — flutter-reviews-api.md).'
        : 'من GET /riders/{id}/reviews (API التطبيق — flutter-reviews-api.md).',
  };
}

async function fetchRestaurantReviews(
  restaurantId: string,
  page: number,
  pageSize: number
): Promise<ReviewsResponse> {
  const res = await apiClient.get(`/restaurants/${restaurantId}/reviews`, {
    params: { page, page_size: pageSize },
  });
  return parseCustomerReviewsList(res.data, 'restaurants/reviews');
}

async function fetchAdminRiderReviews(
  riderId: string,
  page: number,
  pageSize: number
): Promise<ReviewsResponse> {
  const res = await apiClient.get(`/admin/riders/${riderId}/reviews`, {
    params: { page, page_size: pageSize },
  });
  const parsed = parseCustomerReviewsList(res.data, 'riders/reviews');
  return {
    ...parsed,
    dataSource: 'admin/riders/:id/reviews',
    notice: 'من GET /admin/riders/{id}/reviews (مواصفة الأدمن).',
  };
}

async function fetchRiderReviews(
  riderId: string,
  page: number,
  pageSize: number
): Promise<ReviewsResponse> {
  const res = await apiClient.get(`/riders/${riderId}/reviews`, {
    params: { page, page_size: pageSize },
  });
  return parseCustomerReviewsList(res.data, 'riders/reviews');
}

/** بديل عند تعطل GET /admin/reviews — تقييمات السائقين فقط */
async function fetchDriverRatingsFallback(params?: {
  targetType?: string;
  targetId?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ReviewsResponse | null> {
  if (params?.targetType === 'restaurant') return null;

  try {
    const query = cleanListQueryParams({
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      minRating: params?.rating,
      maxRating: params?.rating,
      driverId: params?.targetId,
    });
    const res = await apiClient.get('/admin/driver-ratings', { params: query });
    const rawList = extractListFromResponse(res.data, ['ratings', 'reviews', 'items', 'data']);
    let reviews = rawList.map((r) => mapDriverRatingToReview(r));
    reviews = filterByTargetId(reviews, params?.targetId);
    reviews = applySearchFilter(reviews, params?.search);

    if (process.env.NODE_ENV === 'development') {
      console.warn('[Reviews API] استخدام fallback: /admin/driver-ratings', reviews.length);
    }

    return {
      reviews,
      pagination: extractPagination(res.data, reviews.length),
      dataSource: 'admin/driver-ratings',
      notice:
        'endpoint التقييمات العام GET /admin/reviews يعيد خطأ 500 من السيرفر. المعروض حالياً: تقييمات السائقين فقط من /admin/driver-ratings. تقييمات المطاعم تحتاج إصلاح الباكند.',
    };
  } catch {
    return null;
  }
}

async function realGetReviews(params?: {
  targetType?: string;
  targetId?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ReviewsResponse> {
  if (reviewsListCachedUnavailable) {
    return emptyReviewsResponse(REVIEWS_UNAVAILABLE_MSG);
  }

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const tt = params?.targetType;

  const attempts: Record<string, string | number>[] = [
    cleanListQueryParams({ page, limit }),
    cleanListQueryParams({
      targetType: tt,
      rating: params?.rating,
      search: params?.search,
      page,
      limit,
    }),
    cleanListQueryParams({
      target_type: tt,
      rating: params?.rating,
      search: params?.search,
      page,
      limit,
    }),
  ];

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const query = attempts[i];
    try {
      const result = await fetchReviewsFromApi(query);
      let reviews = result.reviews;
      if (params?.targetId) {
        reviews = filterByTargetId(reviews, params.targetId);
      }
      reviewsListCachedUnavailable = false;
      return {
        reviews,
        pagination: {
          ...result.pagination,
          total: params?.targetId ? reviews.length : result.pagination.total,
        },
        dataSource: 'admin/reviews',
      };
    } catch (err) {
      lastError = err;
      if (axios.isAxiosError(err) && err.response?.status !== 500) break;
    }
  }

  if (!reviewsListCachedUnavailable) {
    const detail = extractApiErrorDetail(lastError);
    console.warn('[Reviews API] غير متاح:', detail || '500', formatResponseData(
      axios.isAxiosError(lastError) ? lastError.response?.data : undefined
    ));
  }

  if (params?.targetId && params?.targetType === 'restaurant') {
    try {
      const fromRestaurant = await fetchRestaurantReviews(params.targetId, page, limit);
      let reviews = fromRestaurant.reviews;
      reviews = applySearchFilter(reviews, params?.search);
      if (params?.rating && params.rating > 0) {
        reviews = reviews.filter((r) => r.rating === params.rating);
      }
      return { ...fromRestaurant, reviews };
    } catch {
      /* try next fallback */
    }
  }

  if (params?.targetId && (params?.targetType === 'rider' || params?.targetType === 'driver')) {
    try {
      const fromAdminRider = await fetchAdminRiderReviews(params.targetId, page, limit);
      let reviews = fromAdminRider.reviews;
      reviews = applySearchFilter(reviews, params?.search);
      if (params?.rating && params.rating > 0) {
        reviews = reviews.filter((r) => r.rating === params.rating);
      }
      return { ...fromAdminRider, reviews };
    } catch {
      /* try public rider reviews */
    }
    try {
      const fromRider = await fetchRiderReviews(params.targetId, page, limit);
      let reviews = fromRider.reviews;
      reviews = applySearchFilter(reviews, params?.search);
      if (params?.rating && params.rating > 0) {
        reviews = reviews.filter((r) => r.rating === params.rating);
      }
      return { ...fromRider, reviews };
    } catch {
      /* try next fallback */
    }
  }

  const fallback = await fetchDriverRatingsFallback(params);
  if (fallback) return fallback;

  reviewsListCachedUnavailable = true;
  return emptyReviewsResponse(REVIEWS_UNAVAILABLE_MSG);
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
  targetId?: string;
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
  if (params?.targetId) {
    result = result.filter((r) => r.targetId === params.targetId);
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
      totalPages: Math.ceil(result.length / limit) || 1,
    },
  };
}

async function mockDeleteReview(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockReviews.findIndex((r) => r.id === id);
  if (idx !== -1) mockReviews.splice(idx, 1);
}

export type GetReviewsParams = {
  targetType?: string;
  targetId?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
};

export async function getReviews(params?: GetReviewsParams): Promise<ReviewsResponse> {
  try {
    const result = shouldUseMock() ? await mockGetReviews(params) : await realGetReviews(params);
    return result;
  } catch (err) {
    if (shouldUseMock()) throw new Error(handleApiError(err));
    reviewsListCachedUnavailable = true;
    return emptyReviewsResponse(handleApiError(err));
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
