import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'customer' | 'driver' | 'restaurant';
  status: 'active' | 'suspended';
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
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
  const { data } = await apiClient.get<UsersResponse>('/admin/users', { params });
  return data;
}

async function realGetUserById(id: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/admin/users/${id}`);
  return data;
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
  const { data } = await apiClient.post<{ id: string; message: string }>('/admin/users', payload);
  return realGetUserById(data.id);
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

