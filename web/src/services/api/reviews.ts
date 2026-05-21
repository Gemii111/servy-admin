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
import { getRiders } from './riders';

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
let adminDriverRatingsKnownMissing = false;

const ADMIN_REVIEWS_CACHE_MS = 20_000;
let adminReviewsListCache: { at: number; reviews: Review[] } | null = null;

/** إعادة محاولة بعد deploy الباكند */
export function clearReviewsUnavailableCache(): void {
  reviewsListCachedUnavailable = false;
  adminReviewsListCache = null;
}

async function fetchAdminReviewsListCached(): Promise<Review[]> {
  if (
    adminReviewsListCache &&
    Date.now() - adminReviewsListCache.at < ADMIN_REVIEWS_CACHE_MS
  ) {
    return adminReviewsListCache.reviews;
  }
  const result = await fetchReviewsFromApi(
    cleanListQueryParams({ page: 1, limit: 100 })
  );
  adminReviewsListCache = { at: Date.now(), reviews: result.reviews };
  reviewsListCachedUnavailable = false;
  return result.reviews;
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

/** فلترة بعد /admin/reviews — الباكند قد يعيد مطاعم+سائق معاً */
export function filterReviewsByTargetType(
  reviews: Review[],
  targetType?: string
): Review[] {
  if (!targetType || targetType === 'all') return reviews;
  if (targetType === 'rider' || targetType === 'driver') {
    return reviews.filter((r) => r.targetType === 'rider');
  }
  if (targetType === 'restaurant') {
    return reviews.filter((r) => r.targetType === 'restaurant');
  }
  return reviews;
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

/** GET /riders/{id}/reviews — flutter-reviews-api.md §5 (snake_case, data.reviews) */
async function fetchRiderReviews(
  riderId: string,
  page: number,
  pageSize: number
): Promise<ReviewsResponse> {
  const size = Math.min(Math.max(pageSize, 1), 50);
  const res = await apiClient.get(`/riders/${riderId}/reviews`, {
    params: { page, page_size: size },
  });
  const parsed = parseCustomerReviewsList(res.data, 'riders/reviews');
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Reviews API] GET /riders/${riderId}/reviews →`,
      parsed.reviews.length,
      'تقييم'
    );
  }
  return parsed;
}

/** واجهة موحّدة لتقييمات سائق واحد (الأدمن + تفاصيل السائق + تقييمات السائقين) */
export async function getRiderReviewsList(
  riderId: string,
  params?: { page?: number; page_size?: number; limit?: number }
): Promise<ReviewsResponse> {
  const page = params?.page ?? 1;
  const pageSize = params?.page_size ?? params?.limit ?? 10;
  if (shouldUseMock()) {
    return mockGetReviews({
      targetType: 'rider',
      targetId: riderId,
      page,
      limit: pageSize,
    });
  }
  return fetchRiderReviews(riderId, page, pageSize);
}

const FLUTTER_RIDER_REVIEWS_MAX_RIDERS = 20;

/** تجميع تقييمات السائقين عبر GET /riders/{id}/reviews لكل سائق (لا يوجد endpoint «كل التقييمات» في الملف) */
export async function aggregateFlutterRiderReviews(params?: {
  driverId?: string;
  page?: number;
  limit?: number;
}): Promise<ReviewsResponse> {
  const page = params?.page ?? 1;
  const pageSize = Math.min(params?.limit ?? 50, 50);

  if (params?.driverId) {
    return getRiderReviewsList(params.driverId, { page, page_size: pageSize });
  }

  const ridersRes = await getRiders({ page: 1, limit: 100 });
  const riders = ridersRes.riders.slice(0, FLUTTER_RIDER_REVIEWS_MAX_RIDERS);
  const allReviews: Review[] = [];
  const triedIds = new Set<string>();

  for (const rider of riders) {
    const ids = [rider.id, rider.userId].filter((id) => id && !triedIds.has(id));
    for (const rid of ids) {
      triedIds.add(rid);
      try {
        const res = await fetchRiderReviews(rid, 1, 50);
        for (const review of res.reviews) {
          allReviews.push({
            ...review,
            targetId: review.targetId || rid,
            targetName: review.targetName !== '—' ? review.targetName : rider.name || '—',
            targetType: 'rider',
          });
        }
        if (res.reviews.length > 0) break;
      } catch {
        /* جرّب userId أو id التالي */
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Reviews API] تجميع سائقين: ${riders.length} سائق، ${allReviews.length} تقييم rider`
    );
  }

  const start = (page - 1) * pageSize;
  const slice = allReviews.slice(start, start + pageSize);

  return {
    reviews: slice,
    pagination: {
      page,
      limit: pageSize,
      total: allReviews.length,
      totalPages: Math.max(1, Math.ceil(allReviews.length / pageSize)),
    },
    dataSource: 'riders/reviews',
    notice:
      allReviews.length > 0
        ? 'تقييمات السائقين من GET /riders/{id}/reviews (flutter-reviews-api.md).'
        : 'لم يُعثر على تقييمات سائقين عبر GET /riders/{id}/reviews لأي سائق.',
  };
}

export type AdminReviewsSnapshot = {
  total: number;
  restaurantCount: number;
  riderCount: number;
  sampleRestaurantName?: string;
};

/** لصفحة تقييمات السائقين — طلب /admin/reviews واحد مُخزَّن */
export async function getAdminReviewsSnapshot(): Promise<AdminReviewsSnapshot> {
  try {
    const all = await fetchAdminReviewsListCached();
    const riders = filterReviewsByTargetType(all, 'rider');
    const restaurants = filterReviewsByTargetType(all, 'restaurant');
    return {
      total: all.length,
      restaurantCount: restaurants.length,
      riderCount: riders.length,
      sampleRestaurantName: restaurants[0]?.targetName,
    };
  } catch {
    return { total: 0, restaurantCount: 0, riderCount: 0 };
  }
}

/** استخراج targetType=rider من قائمة /admin/reviews الكاملة */
export async function getAdminRiderReviewsOnly(
  page: number,
  limit: number
): Promise<ReviewsResponse | null> {
  try {
    const all = await fetchAdminReviewsListCached();
    const riders = filterReviewsByTargetType(all, 'rider');
    if (riders.length === 0) {
      const restaurantCount = all.filter((r) => r.targetType === 'restaurant').length;
      if (process.env.NODE_ENV === 'development' && restaurantCount > 0) {
        console.warn(
          `[Reviews API] /admin/reviews: ${restaurantCount} مطعم، 0 سائق — لا يُعرض في تقييمات السائقين`
        );
      }
      return null;
    }
    const start = (page - 1) * limit;
    const slice = riders.slice(start, start + limit);
    return {
      reviews: slice,
      pagination: {
        page,
        limit,
        total: riders.length,
        totalPages: Math.max(1, Math.ceil(riders.length / limit)),
      },
      dataSource: 'admin/reviews',
      notice: 'تقييمات السائقين من GET /admin/reviews (مفلترة targetType=rider).',
    };
  } catch {
    return null;
  }
}

/** غير موجود على السيرفر (404) — لا تعِد الطلب */
async function fetchDriverRatingsFallback(params?: {
  targetType?: string;
  targetId?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ReviewsResponse | null> {
  if (params?.targetType === 'restaurant') return null;
  if (adminDriverRatingsKnownMissing) return null;

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
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      adminDriverRatingsKnownMissing = true;
    }
    return null;
  }
}

const NO_RIDER_REVIEWS_MSG =
  'لا توجد تقييمات سائقين (targetType=rider). يوجد تقييم مطعم فقط في /admin/reviews — أنشئ تقييم سائق من التطبيق: POST /reviews/rider بعد توصيل الطلب.';

async function realGetRiderReviewsOnly(params?: {
  targetId?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ReviewsResponse> {
  const page = params?.page ?? 1;
  const limit = Math.min(params?.limit ?? 10, 50);

  try {
    const flutter = params?.targetId
      ? await fetchRiderReviews(params.targetId, page, limit)
      : await aggregateFlutterRiderReviews({ page, limit });
    let reviews = flutter.reviews;
    reviews = applySearchFilter(reviews, params?.search);
    if (params?.rating && params.rating > 0) {
      reviews = reviews.filter((r) => r.rating === params.rating);
    }
    if (reviews.length > 0) {
      return { ...flutter, reviews };
    }
  } catch {
    /* */
  }

  const fromAdmin = await getAdminRiderReviewsOnly(page, limit);
  if (fromAdmin && fromAdmin.reviews.length > 0) {
    let reviews = fromAdmin.reviews;
    reviews = applySearchFilter(reviews, params?.search);
    if (params?.rating && params.rating > 0) {
      reviews = reviews.filter((r) => r.rating === params.rating);
    }
    return { ...fromAdmin, reviews };
  }

  const snap = await getAdminReviewsSnapshot();
  const notice =
    snap.restaurantCount > 0
      ? `لا توجد تقييمات سائقين. السيرفر يعيد ${snap.restaurantCount} تقييم مطعم فقط${snap.sampleRestaurantName ? ` (مثال: ${snap.sampleRestaurantName})` : ''}. المصدر: GET /riders/{id}/reviews و GET /admin/reviews — راجع flutter-reviews-api.md.`
      : NO_RIDER_REVIEWS_MSG;

  return {
    reviews: [],
    pagination: { page, limit, total: 0, totalPages: 0 },
    notice,
    apiUnavailable: true,
  };
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
  const limit = Math.min(params?.limit ?? 10, 50);
  const tt = params?.targetType;

  if (tt === 'rider' || tt === 'driver') {
    return realGetRiderReviewsOnly(params);
  }

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
      if (tt) {
        reviews = filterReviewsByTargetType(reviews, tt);
      }
      if (params?.targetId) {
        reviews = filterByTargetId(reviews, params.targetId);
      }
      if ((tt === 'rider' || tt === 'driver') && reviews.length === 0) {
        continue;
      }
      reviewsListCachedUnavailable = false;
      return {
        reviews,
        pagination: {
          ...result.pagination,
          total: params?.targetId || tt ? reviews.length : result.pagination.total,
        },
        dataSource: 'admin/reviews',
        notice:
          tt === 'rider' || tt === 'driver'
            ? 'تقييمات السائقين فقط من GET /admin/reviews.'
            : undefined,
      };
    } catch (err) {
      lastError = err;
      if (axios.isAxiosError(err) && err.response?.status !== 500) break;
    }
  }

  if (lastError && !adminReviewsListCache) {
    const detail = extractApiErrorDetail(lastError);
    const status = axios.isAxiosError(lastError) ? lastError.response?.status : undefined;
    if (status === 500) {
      console.warn('[Reviews API] /admin/reviews 500 —', detail || '');
    }
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
      const fromRider = await fetchRiderReviews(params.targetId, page, limit);
      let reviews = fromRider.reviews;
      reviews = applySearchFilter(reviews, params?.search);
      if (params?.rating && params.rating > 0) {
        reviews = reviews.filter((r) => r.rating === params.rating);
      }
      return { ...fromRider, reviews };
    } catch {
      /* flutter doc endpoint failed — try admin */
    }
    try {
      const fromAdminRider = await fetchAdminRiderReviews(params.targetId, page, limit);
      let reviews = fromAdminRider.reviews;
      reviews = applySearchFilter(reviews, params?.search);
      if (params?.rating && params.rating > 0) {
        reviews = reviews.filter((r) => r.rating === params.rating);
      }
      return { ...fromAdminRider, reviews };
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
