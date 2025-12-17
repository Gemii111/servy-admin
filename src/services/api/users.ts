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

export async function mockGetUsers(params?: {
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

export async function mockGetUserById(id: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  return user;
}

export async function mockUpdateUserStatus(
  id: string,
  status: 'active' | 'suspended'
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = mockUsers.find((u) => u.id === id);
  if (user) user.status = status;
}

export async function mockDeleteUser(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const index = mockUsers.findIndex((u) => u.id === id);
  if (index > -1) mockUsers.splice(index, 1);
}

export async function mockCreateUser(payload: {
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

