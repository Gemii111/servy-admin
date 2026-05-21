/**
 * Riders API Service - Phase 3
 * إدارة السائقين حسب ADMIN_API_PHASE3.md
 */

import axios from 'axios';
import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock, cleanListQueryParams, extractListFromResponse } from './base';

export type RiderStatus =
  | 'available'
  | 'heading_to_restaurant'
  | 'at_restaurant'
  | 'delivering'
  | 'offline';
export type VehicleType = 'motorcycle' | 'car' | 'bike';

export interface Rider {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  status: RiderStatus;
  isActive: boolean;
  /** من is_approved في DB — موافقة انضمام */
  isApproved?: boolean;
  /** يظهر زر «موافقة» */
  needsApproval?: boolean;
  totalDeliveries: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
}

export interface RiderDetail {
  id: string;
  user_id: string;
  rider_name: string;
  phone: string;
  vehicle_type: VehicleType;
  vehicle_plate: string;
  status: RiderStatus;
  current_location?: { latitude: number; longitude: number };
  current_order_count?: number;
  total_deliveries: number;
  rating: number;
  rating_count: number;
  is_active: boolean;
  is_approved?: boolean;
  needs_approval?: boolean;
  last_location_update?: string;
  created_at: string;
}

export interface RiderStats {
  totalRiders: number;
  activeRiders: number;
  onlineRiders: number;
  totalDeliveries: number;
  averageRating: number;
  byStatus: { status: string; count: number }[];
  byVehicle: { vehicleType: string; count: number }[];
}

export interface RidersResponse {
  riders: Rider[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const STATUS_LABELS: Record<string, string> = {
  available: 'متاح',
  heading_to_restaurant: 'في الطريق للمطعم',
  at_restaurant: 'في المطعم',
  delivering: 'يوصّل',
  offline: 'غير متصل',
  active: 'نشط',
  inactive: 'غير نشط',
  pending: 'معلق',
};

const VEHICLE_LABELS: Record<string, string> = {
  motorcycle: 'دراجة نارية',
  car: 'سيارة',
  bike: 'دراجة',
};

export const getRiderStatusLabel = (status: string) => STATUS_LABELS[status] || status;
export const getVehicleLabel = (v: string) => VEHICLE_LABELS[v] || v;

function unwrap<T>(data: unknown): T {
  const d = data as { data?: T };
  return d?.data != null ? d.data : (data as T);
}

function pickString(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = raw[k];
    if (v != null && v !== '') return String(v);
  }
  return '';
}

function pickBool(raw: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const k of keys) {
    if (raw[k] != null) return Boolean(raw[k]);
  }
  return undefined;
}

/** هل السائق يحتاج موافقة أدمن (انضمام جديد) */
export function riderNeedsApproval(r: {
  status?: string;
  is_active?: boolean;
  isActive?: boolean;
  is_approved?: boolean;
  isApproved?: boolean;
  needs_approval?: boolean;
  needsApproval?: boolean;
}): boolean {
  if (r.needs_approval === true || r.needsApproval === true) return true;
  const approved = r.is_approved ?? r.isApproved;
  if (approved === false) return true;
  const status = String(r.status ?? '').toLowerCase();
  if (status === 'pending' || status === 'inactive') return true;
  const active = r.is_active ?? r.isActive;
  if (active === false && (status === 'pending' || status === 'inactive' || status === '')) {
    return true;
  }
  return false;
}

function mapApiRider(raw: Record<string, unknown>): Rider {
  const first = pickString(raw, 'first_name', 'firstName');
  const last = pickString(raw, 'last_name', 'lastName');
  const name =
    pickString(raw, 'name', 'rider_name', 'riderName') ||
    [first, last].filter(Boolean).join(' ') ||
    '—';
  const isApproved = pickBool(raw, 'is_approved', 'isApproved');
  const isActive = pickBool(raw, 'is_active', 'isActive') ?? isApproved ?? false;
  const statusRaw = pickString(raw, 'status') || 'offline';
  const operationalStatuses = new Set([
    'available',
    'heading_to_restaurant',
    'at_restaurant',
    'delivering',
    'offline',
  ]);
  const status = (
    operationalStatuses.has(statusRaw) ? statusRaw : 'offline'
  ) as RiderStatus;

  const rider: Rider = {
    id: String(raw.id ?? ''),
    userId: pickString(raw, 'userId', 'user_id') || '',
    name,
    phone: pickString(raw, 'phone') || '',
    email: pickString(raw, 'email') || '',
    vehicleType: (pickString(raw, 'vehicleType', 'vehicle_type') || 'motorcycle') as VehicleType,
    vehiclePlate: pickString(raw, 'vehiclePlate', 'vehicle_plate') || '',
    status,
    isActive,
    isApproved,
    totalDeliveries: Number(raw.totalDeliveries ?? raw.total_deliveries ?? raw.total_orders ?? 0),
    rating: Number(raw.rating ?? 0),
    ratingCount: Number(raw.ratingCount ?? raw.rating_count ?? 0),
    createdAt: pickString(raw, 'createdAt', 'created_at') || '',
  };
  rider.needsApproval = riderNeedsApproval({
    status: statusRaw,
    is_active: isActive,
    isActive: isActive,
    is_approved: isApproved,
    isApproved: isApproved,
  });
  return rider;
}

function mapApiRiderDetail(raw: Record<string, unknown>): RiderDetail {
  const list = mapApiRider(raw);
  const detail: RiderDetail = {
    id: list.id,
    user_id: list.userId,
    rider_name: list.name,
    phone: list.phone,
    vehicle_type: list.vehicleType,
    vehicle_plate: list.vehiclePlate,
    status: list.status,
    total_deliveries: list.totalDeliveries,
    rating: list.rating,
    rating_count: list.ratingCount,
    is_active: list.isActive,
    is_approved: list.isApproved,
    created_at: list.createdAt,
    needs_approval: list.needsApproval,
  };
  if (raw.current_location && typeof raw.current_location === 'object') {
    detail.current_location = raw.current_location as RiderDetail['current_location'];
  }
  detail.current_order_count = Number(raw.current_order_count ?? raw.currentOrderCount ?? 0);
  detail.last_location_update = pickString(raw, 'last_location_update', 'lastLocationUpdate');
  return detail;
}

// ——— Real API (Phase 3) ———

async function realGetRiders(params?: {
  status?: string;
  vehicleType?: string;
  isActive?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<RidersResponse> {
  const cleaned = cleanListQueryParams({
    status: params?.status,
    vehicle_type: params?.vehicleType,
    is_active: params?.isActive,
    search: params?.search,
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  });

  const res = await apiClient.get('/admin/riders', { params: cleaned });
  const rawList = extractListFromResponse(res.data, ['riders', 'data']);
  const riders = rawList.map((r) => mapApiRider(r));
  const body = (unwrap<Record<string, unknown>>(res.data) ?? res.data) as Record<string, unknown>;
  const pagination = body?.pagination as RidersResponse['pagination'] | undefined;
  return {
    riders,
    pagination:
      pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
  };
}

async function realGetRiderStats(): Promise<RiderStats> {
  const res = await apiClient.get('/admin/riders/stats');
  const data = unwrap<RiderStats>(res.data);
  return data;
}

async function realGetRiderById(id: string): Promise<RiderDetail | null> {
  try {
    const res = await apiClient.get(`/admin/riders/${id}`);
    const raw = unwrap<Record<string, unknown>>(res.data);
    if (!raw || typeof raw !== 'object') return null;
    return mapApiRiderDetail(raw);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

async function realUpdateRiderStatus(
  id: string,
  payload: { isActive?: boolean; status?: string }
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (payload.isActive !== undefined) {
    body.isActive = payload.isActive;
    body.is_active = payload.isActive;
  }
  if (payload.status !== undefined) {
    body.status = payload.status;
  }
  await apiClient.put(`/admin/riders/${id}/status`, body);
}

// ——— Mock (fallback) ———

const mockRiders: Rider[] = [
  {
    id: '1',
    userId: 'u1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+201012345678',
    vehicleType: 'motorcycle',
    vehiclePlate: 'ABC 123',
    status: 'available',
    isActive: true,
    totalDeliveries: 250,
    rating: 4.8,
    ratingCount: 120,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    userId: 'u2',
    name: 'خالد علي',
    email: 'khaled@example.com',
    phone: '+201098765432',
    vehicleType: 'car',
    vehiclePlate: 'XYZ 456',
    status: 'delivering',
    isActive: true,
    totalDeliveries: 180,
    rating: 4.5,
    ratingCount: 90,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: '3',
    userId: 'u3',
    name: 'محمود حسن',
    email: 'mahmoud@example.com',
    phone: '+201055555555',
    vehicleType: 'bike',
    vehiclePlate: '',
    status: 'offline',
    isActive: false,
    isApproved: false,
    needsApproval: true,
    totalDeliveries: 0,
    rating: 0,
    ratingCount: 0,
    createdAt: '2026-03-01T10:00:00Z',
  },
];

export async function mockGetRiders(params?: {
  status?: string;
  vehicleType?: string;
  isActive?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<RidersResponse> {
  await new Promise((r) => setTimeout(r, 300));
  let result = [...mockRiders];
  if (params?.status && params.status !== 'all') {
    result = result.filter((r) => r.status === params.status);
  }
  if (params?.vehicleType && params.vehicleType !== 'all') {
    result = result.filter((r) => r.vehicleType === params.vehicleType);
  }
  if (params?.isActive !== undefined && params.isActive !== '') {
    const active = params.isActive === 'true';
    result = result.filter((r) => r.isActive === active);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q)
    );
  }
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  return {
    riders: result.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: result.length,
      totalPages: Math.ceil(result.length / limit),
    },
  };
}

export async function mockGetRiderStats(): Promise<RiderStats> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    totalRiders: mockRiders.length,
    activeRiders: mockRiders.filter((r) => r.isActive).length,
    onlineRiders: mockRiders.filter((r) => r.status !== 'offline').length,
    totalDeliveries: mockRiders.reduce((s, r) => s + r.totalDeliveries, 0),
    averageRating: 4.5,
    byStatus: [
      { status: 'available', count: 1 },
      { status: 'delivering', count: 1 },
      { status: 'offline', count: 1 },
    ],
    byVehicle: [
      { vehicleType: 'motorcycle', count: 1 },
      { vehicleType: 'car', count: 1 },
      { vehicleType: 'bike', count: 1 },
    ],
  };
}

export async function mockGetRiderById(id: string): Promise<RiderDetail | null> {
  await new Promise((r) => setTimeout(r, 200));
  const r = mockRiders.find((x) => x.id === id);
  if (!r) return null;
  const detail: RiderDetail = {
    id: r.id,
    user_id: r.userId,
    rider_name: r.name,
    phone: r.phone,
    vehicle_type: r.vehicleType,
    vehicle_plate: r.vehiclePlate,
    status: r.status,
    total_deliveries: r.totalDeliveries,
    rating: r.rating,
    rating_count: r.ratingCount,
    is_active: r.isActive,
    is_approved: r.isApproved ?? r.isActive,
    needs_approval: r.needsApproval ?? riderNeedsApproval(r),
    created_at: r.createdAt,
  };
  return detail;
}

export async function mockUpdateRiderStatus(
  id: string,
  payload: { isActive?: boolean; status?: string }
): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockRiders.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('السائق غير موجود');
  if (payload.isActive !== undefined) mockRiders[idx].isActive = payload.isActive;
  if (payload.status !== undefined) mockRiders[idx].status = payload.status as RiderStatus;
}

// ——— Unified API ———

export type GetRidersParams = {
  status?: string;
  vehicleType?: string;
  isActive?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export async function getRiders(params?: GetRidersParams): Promise<RidersResponse> {
  try {
    return shouldUseMock() ? mockGetRiders(params) : realGetRiders(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getRiderStats(): Promise<RiderStats> {
  try {
    return shouldUseMock() ? mockGetRiderStats() : realGetRiderStats();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getRiderById(id: string): Promise<RiderDetail | null> {
  try {
    return shouldUseMock() ? mockGetRiderById(id) : realGetRiderById(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateRiderStatus(
  id: string,
  payload: { isActive?: boolean; status?: string }
): Promise<void> {
  try {
    return shouldUseMock()
      ? mockUpdateRiderStatus(id, payload)
      : realUpdateRiderStatus(id, payload);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

async function realApproveRider(id: string): Promise<void> {
  try {
    await apiClient.put(`/admin/riders/${id}/approve`);
  } catch (err) {
    if (
      axios.isAxiosError(err) &&
      (err.response?.status === 404 || err.response?.status === 405)
    ) {
      await apiClient.post(`/admin/riders/${id}/approve`);
      return;
    }
    throw err;
  }
}

async function mockApproveRider(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  const rider = mockRiders.find((x) => x.id === id);
  if (rider) {
    rider.isActive = true;
    rider.isApproved = true;
    rider.needsApproval = false;
    rider.status = 'available';
  }
}

export async function approveRider(id: string): Promise<void> {
  try {
    return shouldUseMock() ? mockApproveRider(id) : realApproveRider(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
