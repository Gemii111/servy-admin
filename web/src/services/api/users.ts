import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock, cleanListQueryParams } from './base';
import { getLoyaltyAccountDetail } from './loyalty';
import { getRestaurants } from './restaurants';

export type UserTypeFilter = 'customer' | 'driver' | 'restaurant';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** من first_name — قد يكون فارغاً لحسابات السوشيال */
  firstName: string;
  lastName: string;
  /** Normalized for UI filters (vendor/pharmacy → restaurant) */
  userType: UserTypeFilter;
  /** Raw value from API */
  userTypeRaw?: string;
  status: 'active' | 'suspended';
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt?: string;
  /** image_url — null إن لم يرفع صورة */
  imageUrl?: string | null;
  /** is_email_verified — تأكيد البريد فقط، ليس موافقة السائق */
  isEmailVerified: boolean;
  /** restaurant_id — للمتاجر فقط */
  restaurantId?: string | null;
  lastLoginAt?: string | null;
  /** last_seen_at — نشاط الملف وليس اتصال لحظي */
  lastSeenAt?: string | null;
  loyaltyPoints?: number;
  /** Full object from API — use for fields not yet mapped in UI */
  apiRaw: Record<string, unknown>;
  /** true إذا السيرفر أرسل الحقول السبعة من flutter-admin-users-fields.md */
  apiHasExtendedFields: boolean;
}

/** الحقول الموثّقة في flutter-admin-users-fields.md */
export const EXTENDED_USER_API_KEYS = [
  'first_name',
  'firstName',
  'last_name',
  'lastName',
  'image_url',
  'imageUrl',
  'is_email_verified',
  'isEmailVerified',
  'last_login_at',
  'lastLoginAt',
  'last_seen_at',
  'lastSeenAt',
  'restaurant_id',
  'restaurantId',
] as const;

export function userApiHasExtendedFields(raw: Record<string, unknown>): boolean {
  return EXTENDED_USER_API_KEYS.some((k) => Object.prototype.hasOwnProperty.call(raw, k));
}

function splitNameParts(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
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

/** قيم enum في PostgreSQL — لا ترسل merchant/pharmacy/… (تسبب 500) */
const BACKEND_USER_TYPE_QUERY = new Set(['customer', 'driver', 'vendor', 'restaurant', 'admin']);

function mapUserTypeQuery(filter?: string): string | undefined {
  if (!filter || filter === 'all') return undefined;
  if (filter === 'restaurant') return 'vendor';
  if (filter === 'driver') return 'driver';
  return filter;
}

function withUserTypeQueryParams(
  base: Record<string, string | number>,
  userTypeValue: string
): Record<string, string | number> {
  if (!BACKEND_USER_TYPE_QUERY.has(userTypeValue)) {
    return base;
  }
  return { ...base, user_type: userTypeValue };
}

function isMerchantUser(u: User): boolean {
  if (u.userType === 'restaurant') return true;
  const raw = (u.userTypeRaw || '').toLowerCase();
  return MERCHANT_TYPES.has(raw);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** دمج حقول متداخلة مثل { data: { profile: {...} } } */
function flattenUserRaw(raw: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...raw };
  for (const nestKey of ['profile', 'user', 'User', 'customer']) {
    const nested = raw[nestKey];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      Object.assign(merged, nested as Record<string, unknown>);
    }
  }
  return merged;
}

function pickString(raw: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = raw[k];
    if (v != null && v !== '') return String(v);
  }
  return undefined;
}

function pickBool(raw: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const k of keys) {
    if (raw[k] != null) return Boolean(raw[k]);
  }
  return undefined;
}

function resolveUserStatus(raw: Record<string, unknown>): 'active' | 'suspended' {
  const statusRaw = pickString(raw, 'status')?.toLowerCase();
  if (statusRaw === 'suspended' || statusRaw === 'inactive' || statusRaw === 'disabled') {
    return 'suspended';
  }
  const isActive = pickBool(raw, 'is_active', 'isActive');
  if (isActive === false) return 'suspended';
  return 'active';
}

function mapApiUser(raw: Record<string, unknown>): User {
  const flat = flattenUserRaw(raw);
  const apiHasExtendedFields = userApiHasExtendedFields(flat);
  let firstName = pickString(flat, 'first_name', 'firstName', 'FirstName') ?? '';
  let lastName = pickString(flat, 'last_name', 'lastName', 'LastName') ?? '';
  const displayName = pickString(flat, 'name', 'Name')?.trim() ?? '';
  if (!apiHasExtendedFields && !firstName && !lastName && displayName) {
    const split = splitNameParts(displayName);
    firstName = split.firstName;
    lastName = split.lastName;
  }
  const userTypeRaw = pickString(flat, 'user_type', 'userType', 'UserType') ?? 'customer';

  return {
    id: String(flat.id ?? raw.id ?? ''),
    name:
      pickString(flat, 'name', 'Name')?.trim() ||
      [firstName, lastName].filter(Boolean).join(' ') ||
      pickString(flat, 'email', 'Email') ||
      '—',
    email: pickString(flat, 'email', 'Email') ?? '',
    phone: pickString(flat, 'phone', 'phone_number', 'phoneNumber', 'Phone') ?? '',
    firstName,
    lastName,
    userType: normalizeUserType(userTypeRaw),
    userTypeRaw,
    status: resolveUserStatus(flat),
    totalOrders: Number(
      flat.total_orders ??
        flat.totalOrders ??
        flat.no_of_orders ??
        flat.noOfOrders ??
        0
    ),
    totalSpent: Number(flat.total_spent ?? flat.totalSpent ?? 0),
    createdAt: pickString(flat, 'created_at', 'createdAt', 'CreatedAt') ?? '',
    updatedAt: pickString(flat, 'updated_at', 'updatedAt', 'UpdatedAt'),
    imageUrl:
      flat.image_url === null || flat.imageUrl === null
        ? null
        : pickString(flat, 'image_url', 'imageUrl', 'ImageUrl', 'avatar', 'avatar_url') ?? null,
    isEmailVerified:
      pickBool(flat, 'is_email_verified', 'isEmailVerified', 'IsEmailVerified') ?? false,
    restaurantId:
      flat.restaurant_id === null || flat.restaurantId === null
        ? null
        : pickString(flat, 'restaurant_id', 'restaurantId', 'RestaurantId') ?? null,
    lastLoginAt: pickString(
      flat,
      'last_login_at',
      'last_login',
      'lastLoginAt',
      'LastLoginAt',
      'last_login_time'
    ),
    lastSeenAt:
      flat.last_seen_at === null || flat.lastSeenAt === null
        ? null
        : pickString(flat, 'last_seen_at', 'last_seen', 'lastSeenAt', 'LastSeenAt') ?? null,
    loyaltyPoints:
      flat.loyalty_points != null
        ? Number(flat.loyalty_points)
        : flat.loyaltyPoints != null
          ? Number(flat.loyaltyPoints)
          : flat.current_balance != null
            ? Number(flat.current_balance)
            : undefined,
    apiRaw: { ...flat },
    apiHasExtendedFields,
  };
}

function extractRawUsersList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((u) => u && typeof u === 'object') as Record<string, unknown>[];
  }
  if (!data || typeof data !== 'object') return [];

  const root = data as Record<string, unknown>;

  if (Array.isArray(root.users)) {
    return root.users.filter((u) => u && typeof u === 'object') as Record<string, unknown>[];
  }

  const inner = root.data;
  if (Array.isArray(inner)) {
    return inner.filter((u) => u && typeof u === 'object') as Record<string, unknown>[];
  }
  if (inner && typeof inner === 'object') {
    const nested = inner as Record<string, unknown>;
    if (Array.isArray(nested.users)) {
      return nested.users.filter((u) => u && typeof u === 'object') as Record<string, unknown>[];
    }
  }

  return [];
}

function unwrapUsersResponse(data: unknown): UsersResponse {
  const rawList = extractRawUsersList(data);

  if (process.env.NODE_ENV === 'development' && rawList.length > 0) {
    const sample = rawList[0];
    const keys = Object.keys(sample);
    if (!userApiHasExtendedFields(sample)) {
      console.warn('[Users API] حقول موسّعة غير متوفرة — المرسل:', keys);
    }
  }

  const users = rawList.map(mapApiUser);

  const root =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const pagSource =
    (root.pagination as UsersResponse['pagination']) ??
    (root.data &&
    typeof root.data === 'object' &&
    !Array.isArray(root.data)
      ? ((root.data as Record<string, unknown>).pagination as UsersResponse['pagination'])
      : undefined);

  const pagination = pagSource ?? {
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
  notice?: string;
  dataSource?: 'admin/users' | 'admin/restaurants';
}

function buildUsersListQuery(params?: {
  userType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  /** عند التجار: لا ترسل نوعاً واحداً فقط */
  omitTypeFilter?: boolean;
}): Record<string, string | number> {
  const limit = Math.min(Math.max(params?.limit ?? 50, 1), 100);
  const base = cleanListQueryParams({
    status: params?.status,
    search: params?.search?.trim(),
    q: params?.search?.trim(),
    page: params?.page ?? 1,
    limit,
    page_size: limit,
  });
  if (params?.omitTypeFilter) return base;
  const mapped = mapUserTypeQuery(params?.userType);
  if (!mapped) return base;
  return withUserTypeQueryParams(base, mapped);
}

async function fetchUsersListPage(
  query: Record<string, string | number>
): Promise<UsersResponse> {
  const { data } = await apiClient.get('/admin/users', { params: query });
  const result = unwrapUsersResponse(data);
  return { ...result, dataSource: 'admin/users' };
}

async function tryFetchUserByDirectLookup(search: string): Promise<User | null> {
  const term = search.trim();
  if (!term) return null;
  if (UUID_RE.test(term)) {
    try {
      return await realGetUserById(term);
    } catch {
      return null;
    }
  }
  return null;
}

function mergeUsersDedupe(users: User[]): User[] {
  const map = new Map<string, User>();
  users.forEach((u) => {
    if (u.id) map.set(u.id, u);
  });
  return Array.from(map.values());
}

function paginateUsersList(
  users: User[],
  params?: { page?: number; limit?: number }
): Pick<UsersResponse, 'users' | 'pagination'> {
  const limit = Math.min(params?.limit ?? 50, 100);
  const page = params?.page ?? 1;
  const start = (page - 1) * limit;
  return {
    users: users.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: users.length,
      totalPages: Math.max(1, Math.ceil(users.length / limit)),
    },
  };
}

function applyMerchantSearchFilter(users: User[], search?: string): User[] {
  const q = search?.trim().toLowerCase();
  if (!q) return users;
  return users.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.restaurantId?.toLowerCase().includes(q) ?? false)
  );
}

/** طلب واحد user_type=vendor ثم fallback لـ /admin/restaurants — بدون حلقة أنواع (تجنب 500 و429) */
async function fetchMerchantUsers(
  params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<UsersResponse> {
  const base = buildUsersListQuery({ ...params, omitTypeFilter: true });

  try {
    const res = await fetchUsersListPage(withUserTypeQueryParams(base, 'vendor'));
    let users = mergeUsersDedupe(res.users.filter(isMerchantUser));
    users = applyMerchantSearchFilter(users, params?.search);
    if (users.length > 0) {
      return {
        ...paginateUsersList(users, params),
        dataSource: 'admin/users',
        notice: 'تجار/متاجر من GET /admin/users?user_type=vendor',
      };
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Users API] vendor filter:', err);
    }
  }

  return merchantsUsersFromRestaurants(params);
}

async function merchantsUsersFromRestaurants(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<UsersResponse> {
  const limit = Math.min(params?.limit ?? 50, 100);
  const page = params?.page ?? 1;
  const res = await getRestaurants({
    search: params?.search,
    page,
    limit,
  });

  const users: User[] = res.restaurants.map((r) => {
    const ownerId = r.ownerUserId || `restaurant-owner-${r.id}`;
    return {
      id: ownerId,
      name: r.ownerName?.trim() || r.name,
      email: r.ownerEmail,
      phone: r.phone,
      firstName: '',
      lastName: '',
      userType: 'restaurant' as const,
      userTypeRaw: 'vendor',
      status: r.status === 'suspended' ? 'suspended' : 'active',
      totalOrders: r.totalOrders,
      totalSpent: r.totalRevenue,
      createdAt: r.createdAt,
      restaurantId: r.id,
      imageUrl: r.imageUrl ?? null,
      isEmailVerified: false,
      apiRaw: {
        source: 'admin/restaurants',
        restaurant_id: r.id,
        restaurant_name: r.name,
        owner_user_id: r.ownerUserId,
        vendor_type: r.vendorType,
      },
      apiHasExtendedFields: false,
    };
  });

  return {
    users,
    pagination: res.pagination,
    dataSource: 'admin/restaurants',
    notice:
      'حسابات التجار من قائمة المتاجر (GET /admin/restaurants) — قد لا تظهر في GET /admin/users. للمتجر ككيان: صفحة المطاعم.',
  };
}

async function realGetUsers(params?: {
  userType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<UsersResponse> {
  if (params?.userType === 'restaurant') {
    return fetchMerchantUsers(params);
  }

  const query = buildUsersListQuery(params);
  let result = await fetchUsersListPage(query);

  const direct = params?.search ? await tryFetchUserByDirectLookup(params.search) : null;
  if (direct && !result.users.some((u) => u.id === direct.id)) {
    result = {
      ...result,
      users: [direct, ...result.users],
      pagination: {
        ...result.pagination,
        total: result.pagination.total + 1,
      },
    };
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[Users API]',
      `صفحة ${result.pagination.page}/${result.pagination.totalPages}`,
      `— ${result.users.length} من ${result.pagination.total}`
    );
  }

  return result;
}

async function attachLoyaltyBalance(user: User): Promise<User> {
  try {
    const detail = await getLoyaltyAccountDetail(user.id);
    const balance = detail?.account?.current_balance;
    if (balance == null) return user;
    return {
      ...user,
      loyaltyPoints: balance,
      apiRaw: { ...user.apiRaw, loyalty_current_balance: balance },
    };
  } catch {
    return user;
  }
}

async function realGetUserById(id: string): Promise<User> {
  const { data } = await apiClient.get(`/admin/users/${id}`);
  let raw: Record<string, unknown> = {};
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
      raw = o.data as Record<string, unknown>;
    } else {
      raw = o;
    }
  }
  if (process.env.NODE_ENV === 'development' && !userApiHasExtendedFields(raw)) {
    console.warn(
      '[Users API] تفاصيل مستخدم بدون الحقول الموسّعة — الحقول المرسلة:',
      Object.keys(raw)
    );
  }
  const user = mapApiUser(raw);
  return attachLoyaltyBalance(user);
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
const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => {
  const createdAt = new Date(
    Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
  ).toISOString();
  const apiRaw: Record<string, unknown> = {
    id: `user-${i + 1}`,
    first_name: `مستخدم`,
    last_name: `${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `+966501234${String(i).padStart(3, '0')}`,
    user_type: (['customer', 'driver', 'vendor'] as const)[i % 3],
    status: i % 10 === 0 ? 'suspended' : 'active',
    is_email_verified: i % 3 === 0,
    total_orders: Math.floor(Math.random() * 100) + 1,
    total_spent: Math.floor(Math.random() * 10000) + 100,
    created_at: createdAt,
    last_login_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_online: i % 5 === 0,
  };
  return mapApiUser(apiRaw);
});

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
  const parts = payload.name.trim().split(/\s+/);
  const newUser: User = {
    id: `user-${mockUsers.length + 1}`,
    name: payload.name,
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') ?? '',
    email: payload.email,
    phone: payload.phone,
    userType: payload.userType,
    status: payload.status || 'active',
    totalOrders: 0,
    totalSpent: 0,
    createdAt: now,
    isEmailVerified: false,
    apiRaw: {},
    apiHasExtendedFields: false,
  };

  mockUsers.push(newUser);
  return newUser;
}

