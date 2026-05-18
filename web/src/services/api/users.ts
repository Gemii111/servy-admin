import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock, cleanListQueryParams } from './base';

export type UserTypeFilter = 'customer' | 'driver' | 'restaurant';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** Normalized for UI filters (vendor/pharmacy → restaurant) */
  userType: UserTypeFilter;
  /** Raw value from API */
  userTypeRaw?: string;
  status: 'active' | 'suspended';
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

const MERCHANT_TYPES = new Set([
  'restaurant',
  'vendor',
  'pharmacy',
  'supermarket',
  'merchant',
  'restaurant_owner',
]);

function normalizeUserType(raw: string): UserTypeFilter {
  const t = raw.toLowerCase();
  if (t === 'driver' || t === 'rider') return 'driver';
  if (MERCHANT_TYPES.has(t)) return 'restaurant';
  if (t === 'customer') return 'customer';
  return 'customer';
}

function mapUserTypeQuery(filter?: string): string | undefined {
  if (!filter || filter === 'all') return undefined;
  if (filter === 'restaurant') return 'vendor';
  if (filter === 'driver') return 'driver';
  return filter;
}

function mapApiUser(raw: Record<string, unknown>): User {
  const firstName = String(raw.first_name ?? raw.firstName ?? '').trim();
  const lastName = String(raw.last_name ?? raw.lastName ?? '').trim();
  const userTypeRaw = String(raw.user_type ?? raw.userType ?? 'customer');
  const statusRaw = String(raw.status ?? 'active').toLowerCase();

  return {
    id: String(raw.id ?? ''),
    name:
      String(raw.name ?? '').trim() ||
      [firstName, lastName].filter(Boolean).join(' ') ||
      String(raw.email ?? '—'),
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? raw.phone_number ?? raw.phoneNumber ?? ''),
    userType: normalizeUserType(userTypeRaw),
    userTypeRaw,
    status: statusRaw === 'suspended' ? 'suspended' : 'active',
    totalOrders: Number(raw.total_orders ?? raw.totalOrders ?? 0),
    totalSpent: Number(raw.total_spent ?? raw.totalSpent ?? 0),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
  };
}

function unwrapUsersResponse(data: unknown): UsersResponse {
  const body = (data as { data?: UsersResponse }).data ?? (data as UsersResponse);
  const rawUsers = (body as { users?: unknown[] }).users ?? [];
  const users = Array.isArray(rawUsers)
    ? rawUsers.map((u) => mapApiUser(u as Record<string, unknown>))
    : [];
  const pagination = (body as UsersResponse).pagination ?? {
    page: 1,
    limit: 10,
    total: users.length,
    totalPages: 1,
  };
  return { users, pagination };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function realGetUsers(params?: {
  userType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<UsersResponse> {
  const cleaned = cleanListQueryParams({
    user_type: mapUserTypeQuery(params?.userType),
    status: params?.status,
    search: params?.search,
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  });
  const { data } = await apiClient.get('/admin/users', { params: cleaned });
  let result = unwrapUsersResponse(data);

  if (params?.userType === 'restaurant') {
    result = {
      ...result,
      users: result.users.filter((u) => u.userType === 'restaurant'),
    };
  }

  return result;
}

async function realGetUserById(id: string): Promise<User> {
  const { data } = await apiClient.get(`/admin/users/${id}`);
  const body = (data as { data?: Record<string, unknown> }).data ?? data;
  return mapApiUser(body as Record<string, unknown>);
}

async function realUpdateUserStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
  await apiClient.put(`/admin/users/${id}/status`, { status });
}

async function realDeleteUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

async function realCreateUser(payload: {
  name: string;
  email: string;
  phone: string;
  userType: 'customer' | 'driver' | 'restaurant';
  status?: 'active' | 'suspended';
}): Promise<User> {
  const { data } = await apiClient.post<{ id: string; message: string }>('/admin/users', {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    user_type: payload.userType,
    status: payload.status ?? 'active',
  });
  const id = (data as { id?: string }).id ?? (data as { data?: { id?: string } }).data?.id;
  if (!id) throw new Error('لم يُرجع السيرفر معرّف المستخدم');
  return realGetUserById(id);
}

export interface ResetPasswordResult {
  message: string;
  temporary_password?: string;
}

async function realResetUserPassword(
  id: string,
  newPassword?: string
): Promise<ResetPasswordResult> {
  const body = newPassword?.trim() ? { new_password: newPassword.trim() } : {};
  const { data } = await apiClient.post<ResetPasswordResult>(
    `/admin/users/${id}/reset-password`,
    body
  );
  return data;
}

async function mockResetUserPassword(
  id: string,
  newPassword?: string
): Promise<ResetPasswordResult> {
  await new Promise((r) => setTimeout(r, 300));
  if (newPassword && newPassword.length < 8) {
    throw new Error('new_password must be at least 8 characters');
  }
  return {
    message: 'Password reset successfully',
    temporary_password: newPassword ? undefined : 'Kx7nP2qR4mZw',
  };
}

export async function resetUserPassword(
  id: string,
  newPassword?: string
): Promise<ResetPasswordResult> {
  try {
    return shouldUseMock()
      ? mockResetUserPassword(id, newPassword)
      : realResetUserPassword(id, newPassword);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getUsers(params?: Parameters<typeof realGetUsers>[0]): Promise<UsersResponse> {
  try {
    return shouldUseMock() ? mockGetUsers(params) : realGetUsers(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getUserById(id: string): Promise<User> {
  try {
    return shouldUseMock() ? mockGetUserById(id) : realGetUserById(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateUserStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
  try {
    return shouldUseMock() ? mockUpdateUserStatus(id, status) : realUpdateUserStatus(id, status);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    return shouldUseMock() ? mockDeleteUser(id) : realDeleteUser(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function createUser(payload: {
  name: string;
  email: string;
  phone: string;
  userType: 'customer' | 'driver' | 'restaurant';
  status?: 'active' | 'suspended';
}): Promise<User> {
  try {
    return shouldUseMock() ? mockCreateUser(payload) : realCreateUser(payload);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

// Mock users data
const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `مستخدم ${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `+966501234${String(i).padStart(3, '0')}`,
  userType: (['customer', 'driver', 'restaurant'] as const)[i % 3],
  status: i % 10 === 0 ? 'suspended' : 'active',
  totalOrders: Math.floor(Math.random() * 100) + 1,
  totalSpent: Math.floor(Math.random() * 10000) + 100,
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
}));

async function mockGetUsers(params?: {
  userType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<UsersResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...mockUsers];

  // Filter by userType
  if (params?.userType && params.userType !== 'all') {
    filtered = filtered.filter((u) => u.userType === params.userType);
  }

  // Filter by status
  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((u) => u.status === params.status);
  }

  // Search
  if (params?.search) {
    const query = params.search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone.includes(query)
    );
  }

  // Pagination
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    users: filtered.slice(start, end),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

async function mockGetUserById(id: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  return user;
}

async function mockUpdateUserStatus(
  id: string,
  status: 'active' | 'suspended'
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = mockUsers.find((u) => u.id === id);
  if (user) user.status = status;
}

async function mockDeleteUser(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const index = mockUsers.findIndex((u) => u.id === id);
  if (index > -1) mockUsers.splice(index, 1);
}

async function mockCreateUser(payload: {
  name: string;
  email: string;
  phone: string;
  userType: 'customer' | 'driver' | 'restaurant';
  status?: 'active' | 'suspended';
}): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const now = new Date().toISOString();
  const newUser: User = {
    id: `user-${mockUsers.length + 1}`,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    userType: payload.userType,
    status: payload.status || 'active',
    totalOrders: 0,
    totalSpent: 0,
    createdAt: now,
  };

  mockUsers.push(newUser);
  return newUser;
}

