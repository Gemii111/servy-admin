import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock, cleanListQueryParams, unwrap, extractListFromResponse } from './base';

export type VendorType = 'restaurant' | 'pharmacy' | 'supermarket';

export interface Restaurant {
  id: string;
  name: string;
  ownerEmail: string;
  ownerName: string;
  phone: string;
  cuisineType: string;
  status: 'approved' | 'pending' | 'suspended';
  vendorType: VendorType;
  isFeatured: boolean;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  createdAt: string;
  address?: string;
  description?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  minOrderAmount?: number;
  deliveryFee?: number;
  deliveryTime?: number;
  imageUrl?: string;
  isVerifiedSeller?: boolean;
  returnPolicySummary?: string;
  returnPolicyUrl?: string;
  supportsSecurePayment?: boolean;
  deliveryBadgeLabel?: string;
  deliveryGuarantee?: string;
  acceptedPaymentMethods?: string[];
}

export interface RestaurantUpdatePayload {
  restaurant_name?: string;
  description?: string;
  category?: string;
  address?: string;
  city?: string;
  phone?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  min_order_amount?: number;
  delivery_fee?: number;
  delivery_time?: number;
  vendor_type?: VendorType;
  is_verified_seller?: boolean;
  return_policy_summary?: string;
  return_policy_url?: string;
  supports_secure_payment?: boolean;
  delivery_badge_label?: string;
  delivery_guarantee?: string;
  accepted_payment_methods?: string[];
}

export interface CreateRestaurantPayload {
  owner_user_id?: string;
  owner_email?: string;
  restaurant_name: string;
  description?: string;
  category?: string;
  address?: string;
  city?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  min_order_amount?: number;
  image_url?: string;
  delivery_fee?: number;
  delivery_time?: number;
  vendor_type?: VendorType;
}

export interface RestaurantsResponse {
  restaurants: Restaurant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Backend uses open | closed | pending | suspended; we use approved | pending | suspended */
const apiStatusToApp = (s: string): Restaurant['status'] => {
  if (s === 'pending' || s === 'suspended') return s;
  return 'approved'; // open, closed
};
const appStatusToApi = (s: Restaurant['status']): string => {
  if (s === 'approved') return 'open';
  return s;
};

function mapApiRestaurant(r: Record<string, unknown>): Restaurant {
  return {
    id: String(r.id),
    name: String(r.name ?? r.restaurant_name ?? ''),
    ownerEmail: String(r.ownerEmail ?? r.owner_email ?? ''),
    ownerName: String(r.ownerName ?? r.owner_name ?? ''),
    phone: String(r.phone ?? ''),
    cuisineType: String(r.cuisineType ?? r.category ?? ''),
    status: apiStatusToApp(String(r.status)),
    vendorType: (r.vendorType ?? r.vendor_type ?? 'restaurant') as VendorType,
    isFeatured: Boolean(r.isFeatured ?? r.is_featured ?? false),
    totalOrders: Number(r.totalOrders ?? r.total_orders ?? 0),
    totalRevenue: Number(r.totalRevenue ?? r.total_revenue ?? 0),
    rating: Number(r.rating ?? 0),
    createdAt: String(r.createdAt ?? r.created_at ?? ''),
    address: r.address != null ? String(r.address) : undefined,
    description: r.description != null ? String(r.description) : undefined,
    city: r.city != null ? String(r.city) : undefined,
    latitude: r.latitude != null ? Number(r.latitude) : undefined,
    longitude: r.longitude != null ? Number(r.longitude) : undefined,
    minOrderAmount: r.minOrderAmount != null ? Number(r.minOrderAmount) : r.min_order_amount != null ? Number(r.min_order_amount) : undefined,
    deliveryFee: r.deliveryFee != null ? Number(r.deliveryFee) : r.delivery_fee != null ? Number(r.delivery_fee) : undefined,
    deliveryTime: r.deliveryTime != null ? Number(r.deliveryTime) : r.delivery_time != null ? Number(r.delivery_time) : undefined,
    imageUrl: r.imageUrl != null ? String(r.imageUrl) : r.image_url != null ? String(r.image_url) : undefined,
    isVerifiedSeller: Boolean(r.isVerifiedSeller ?? r.is_verified_seller ?? false),
    returnPolicySummary: r.returnPolicySummary != null ? String(r.returnPolicySummary) : r.return_policy_summary != null ? String(r.return_policy_summary) : undefined,
    returnPolicyUrl: r.returnPolicyUrl != null ? String(r.returnPolicyUrl) : r.return_policy_url != null ? String(r.return_policy_url) : undefined,
    supportsSecurePayment: Boolean(r.supportsSecurePayment ?? r.supports_secure_payment ?? false),
    deliveryBadgeLabel: r.deliveryBadgeLabel != null ? String(r.deliveryBadgeLabel) : r.delivery_badge_label != null ? String(r.delivery_badge_label) : undefined,
    deliveryGuarantee: r.deliveryGuarantee != null ? String(r.deliveryGuarantee) : r.delivery_guarantee != null ? String(r.delivery_guarantee) : undefined,
    acceptedPaymentMethods: (r.acceptedPaymentMethods ?? r.accepted_payment_methods) as string[] | undefined,
  };
}

async function realGetRestaurants(params?: {
  status?: string;
  vendorType?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<RestaurantsResponse> {
  const cleaned = cleanListQueryParams({
    status: params?.status,
    vendor_type: params?.vendorType,
    search: params?.search,
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  });

  const res = await apiClient.get('/admin/restaurants', { params: cleaned });
  const raw = res.data as unknown;
  const envelope =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const arr = extractListFromResponse(raw, ['restaurants', 'vendors', 'items', 'results']);
  const pag = envelope.pagination as RestaurantsResponse['pagination'] | undefined;
  return {
    restaurants: arr.map(mapApiRestaurant),
    pagination: pag ?? { page: 1, limit: 10, total: arr.length, totalPages: Math.ceil(arr.length / 10) },
  };
}

async function realGetRestaurantById(id: string): Promise<Restaurant> {
  const res = await apiClient.get(`/admin/restaurants/${id}`);
  const data = unwrap<Record<string, unknown>>(res.data) ?? (res.data as Record<string, unknown>);
  return mapApiRestaurant(data);
}

async function realUpdateRestaurantStatus(
  id: string,
  status: 'approved' | 'pending' | 'suspended'
): Promise<void> {
  await apiClient.put(`/admin/restaurants/${id}/status`, { status: appStatusToApi(status) });
}

async function realDeleteRestaurant(id: string): Promise<void> {
  await apiClient.delete(`/admin/restaurants/${id}`);
}

async function realUpdateRestaurant(id: string, payload: RestaurantUpdatePayload): Promise<void> {
  await apiClient.put(`/admin/restaurants/${id}`, payload);
}

async function realSetRestaurantVerified(id: string, isVerified: boolean): Promise<boolean> {
  const { data } = await apiClient.put<{ is_verified_seller: boolean }>(
    `/admin/restaurants/${id}/verified`,
    { is_verified_seller: isVerified }
  );
  return data.is_verified_seller ?? isVerified;
}

async function realCreateRestaurant(
  payload: CreateRestaurantPayload
): Promise<{ id: string; message: string }> {
  const { data } = await apiClient.post<{ id: string; message: string }>(
    '/admin/restaurants',
    payload
  );
  return data;
}

// Mock restaurants data
const VENDOR_TYPES: VendorType[] = ['restaurant', 'pharmacy', 'supermarket'];
const VENDOR_NAMES: Record<VendorType, string[]> = {
  restaurant: ['الشام', 'بيتزا هت', 'كنتاكي', 'ماكدونالدز', 'برجر كنج', 'دومينوز', 'سوبواي', 'كافيه نيوم'],
  pharmacy: ['صيدلية النور', 'صيدلية الحكمة', 'صيدلية العليا', 'صيدلية الأمل'],
  supermarket: ['سوبر ماركت الخير', 'هايبر ماركت', 'سوبر ماركت المدينة'],
};

const mockRestaurants: Restaurant[] = Array.from({ length: 40 }, (_, i) => {
  const vendorType = VENDOR_TYPES[i % 3];
  const prefix = vendorType === 'restaurant' ? 'مطعم' : vendorType === 'pharmacy' ? 'صيدلية' : 'سوبرماركت';
  const names = VENDOR_NAMES[vendorType];
  return {
    id: `restaurant-${i + 1}`,
    name: `${prefix} ${names[i % names.length]} ${i + 1}`,
    ownerEmail: `owner${i + 1}@example.com`,
    ownerName: `صاحب ${prefix} ${i + 1}`,
    phone: `+966501234${String(i).padStart(3, '0')}`,
    cuisineType: ['عربي', 'إيطالي', 'أمريكي', 'آسيوي', 'مشاوي', 'حلويات'][i % 6],
    status: i % 5 === 0 ? 'pending' : i % 10 === 0 ? 'suspended' : 'approved',
    vendorType,
    isFeatured: i % 7 === 0,
    totalOrders: Math.floor(Math.random() * 500) + 50,
    totalRevenue: Math.floor(Math.random() * 50000) + 5000,
    rating: Number((Math.random() * 2 + 3).toFixed(1)),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    address: `شارع ${i + 1}, الرياض`,
    description: `وصف ${prefix} ${i + 1}`,
  };
});

export async function mockGetRestaurants(params?: {
  status?: string;
  vendorType?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<RestaurantsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...mockRestaurants];

  // Filter by status
  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((r) => r.status === params.status);
  }

  // Filter by vendor type
  if (params?.vendorType && params.vendorType !== 'all') {
    filtered = filtered.filter((r) => r.vendorType === params.vendorType);
  }

  // Search
  if (params?.search) {
    const query = params.search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.ownerEmail.toLowerCase().includes(query) ||
        r.cuisineType.toLowerCase().includes(query)
    );
  }

  // Pagination
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    restaurants: filtered.slice(start, end),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function mockGetRestaurantById(id: string): Promise<Restaurant> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const restaurant = mockRestaurants.find((r) => r.id === id);
  if (!restaurant) throw new Error('Restaurant not found');
  return restaurant;
}

export async function mockApproveRestaurant(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const restaurant = mockRestaurants.find((r) => r.id === id);
  if (restaurant) restaurant.status = 'approved';
}

export async function mockRejectRestaurant(id: string, reason: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const restaurant = mockRestaurants.find((r) => r.id === id);
  if (restaurant) restaurant.status = 'suspended';
}

export async function mockUpdateRestaurantStatus(
  id: string,
  status: 'approved' | 'pending' | 'suspended'
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const restaurant = mockRestaurants.find((r) => r.id === id);
  if (restaurant) restaurant.status = status;
}

export async function mockToggleRestaurantFeatured(id: string): Promise<Restaurant> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const restaurant = mockRestaurants.find((r) => r.id === id);
  if (!restaurant) throw new Error('Restaurant not found');
  restaurant.isFeatured = !restaurant.isFeatured;
  return restaurant;
}

export async function mockCreateRestaurant(payload: {
  name: string;
  ownerEmail: string;
  ownerName: string;
  phone: string;
  cuisineType: string;
  address?: string;
  description?: string;
  status?: 'approved' | 'pending' | 'suspended';
}): Promise<Restaurant> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const now = new Date().toISOString();
  const newRestaurant: Restaurant = {
    id: `restaurant-${mockRestaurants.length + 1}`,
    name: payload.name,
    ownerEmail: payload.ownerEmail,
    ownerName: payload.ownerName,
    phone: payload.phone,
    cuisineType: payload.cuisineType,
    status: payload.status || 'pending',
    vendorType: 'restaurant',
    isFeatured: false,
    totalOrders: 0,
    totalRevenue: 0,
    rating: 0,
    createdAt: now,
    address: payload.address,
    description: payload.description,
  };

  mockRestaurants.push(newRestaurant);
  return newRestaurant;
}

// ——— Unified API (mock vs real) ———

export type GetRestaurantsParams = {
  status?: string;
  vendorType?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export async function getRestaurants(params?: GetRestaurantsParams): Promise<RestaurantsResponse> {
  try {
    return shouldUseMock() ? mockGetRestaurants(params) : realGetRestaurants(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getRestaurantById(id: string): Promise<Restaurant> {
  try {
    return shouldUseMock() ? mockGetRestaurantById(id) : realGetRestaurantById(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateRestaurantStatus(
  id: string,
  status: 'approved' | 'pending' | 'suspended'
): Promise<void> {
  try {
    return shouldUseMock()
      ? mockUpdateRestaurantStatus(id, status)
      : realUpdateRestaurantStatus(id, status);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

async function mockDeleteRestaurant(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const idx = mockRestaurants.findIndex((r) => r.id === id);
  if (idx !== -1) mockRestaurants.splice(idx, 1);
}

export async function deleteRestaurant(id: string): Promise<void> {
  try {
    return shouldUseMock() ? mockDeleteRestaurant(id) : realDeleteRestaurant(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateRestaurant(
  id: string,
  payload: RestaurantUpdatePayload
): Promise<void> {
  try {
    if (shouldUseMock()) {
      const idx = mockRestaurants.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('المطعم غير موجود');
      if (payload.restaurant_name) mockRestaurants[idx].name = payload.restaurant_name;
      if (payload.is_verified_seller != null) {
        mockRestaurants[idx].isVerifiedSeller = payload.is_verified_seller;
      }
      return;
    }
    return realUpdateRestaurant(id, payload);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function setRestaurantVerified(id: string, isVerified: boolean): Promise<boolean> {
  try {
    if (shouldUseMock()) {
      const r = mockRestaurants.find((x) => x.id === id);
      if (!r) throw new Error('المطعم غير موجود');
      r.isVerifiedSeller = isVerified;
      return isVerified;
    }
    return realSetRestaurantVerified(id, isVerified);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function createRestaurant(
  payload: CreateRestaurantPayload
): Promise<{ id: string; message: string }> {
  try {
    if (shouldUseMock()) {
      await new Promise((r) => setTimeout(r, 300));
      const id = `restaurant-${mockRestaurants.length + 1}`;
      mockRestaurants.push({
        id,
        name: payload.restaurant_name,
        ownerEmail: payload.owner_email || '',
        ownerName: '',
        phone: payload.phone || '',
        cuisineType: payload.category || '',
        status: 'approved',
        vendorType: payload.vendor_type || 'restaurant',
        isFeatured: false,
        totalOrders: 0,
        totalRevenue: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });
      return { id, message: 'Restaurant created successfully' };
    }
    return realCreateRestaurant(payload);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

