import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiCategory {
  id: string;
  name: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

function unwrap<T>(data: unknown): T {
  const d = data as { data?: T };
  return d?.data != null ? d.data : (data as T);
}

function mapApiCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.id,
    isActive: c.isActive,
    sortOrder: c.sortOrder ?? 0,
    createdAt: c.createdAt,
    updatedAt: c.createdAt,
  };
}

async function realGetCategories(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<CategoriesResponse> {
  const res = await apiClient.get<{ categories?: ApiCategory[]; pagination: CategoriesResponse['pagination'] }>(
    '/admin/categories',
    { params }
  );
  const body = unwrap<{ categories?: ApiCategory[]; pagination: CategoriesResponse['pagination'] }>(res.data) ?? res.data;
  const list = body.categories ?? [];
  return {
    categories: list.map(mapApiCategory),
    pagination: body.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
}

async function realCreateCategory(payload: {
  name: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<Category> {
  const res = await apiClient.post<ApiCategory>('/admin/categories', {
    name: payload.name,
    imageUrl: payload.imageUrl,
    sortOrder: payload.sortOrder ?? 0,
    isActive: payload.isActive ?? true,
  });
  const data = unwrap<ApiCategory>(res.data) ?? res.data;
  return mapApiCategory(data);
}

async function realUpdateCategory(
  id: string,
  payload: Partial<{ name: string; imageUrl: string; sortOrder: number; isActive: boolean }>
): Promise<void> {
  await apiClient.put(`/admin/categories/${id}`, payload);
}

async function realDeleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`);
}

async function realToggleCategoryStatus(id: string): Promise<void> {
  await apiClient.put(`/admin/categories/${id}/toggle`);
}

// Mock categories data
let mockCategories: Category[] = Array.from({ length: 18 }, (_, i) => ({
  id: `category-${i + 1}`,
  name: [
    'البرجر',
    'البيتزا',
    'المشاوي',
    'الحلويات',
    'المأكولات البحرية',
    'السندويتشات',
    'المقبلات',
    'المشروبات',
    'القهوة',
    'السلطات',
  ][i % 10],
  slug: `category-${i + 1}`,
  description: `وصف مختصر لفئة رقم ${i + 1}`,
  isActive: i % 7 !== 0,
  sortOrder: i + 1,
  createdAt: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}));

export async function mockGetCategories(params?: {
  status?: 'all' | 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}): Promise<CategoriesResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  let filtered = [...mockCategories];

  // Filter by status
  if (params?.status && params.status !== 'all') {
    const active = params.status === 'active';
    filtered = filtered.filter((c) => c.isActive === active);
  }

  // Search
  if (params?.search) {
    const query = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        (c.description || '').toLowerCase().includes(query)
    );
  }

  // Sort by sortOrder then createdAt
  filtered.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    categories: filtered.slice(start, end),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function mockCreateCategory(payload: {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}): Promise<Category> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const now = new Date().toISOString();
  const newCategory: Category = {
    id: `category-${mockCategories.length + 1}`,
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    isActive: payload.isActive ?? true,
    sortOrder: payload.sortOrder ?? mockCategories.length + 1,
    createdAt: now,
    updatedAt: now,
  };

  mockCategories = [newCategory, ...mockCategories];
  return newCategory;
}

export async function mockUpdateCategory(
  id: string,
  payload: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<Category> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockCategories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Category not found');
  }

  const updated: Category = {
    ...mockCategories[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  mockCategories[index] = updated;
  return updated;
}

export async function mockDeleteCategory(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockCategories = mockCategories.filter((c) => c.id !== id);
}

export async function mockToggleCategoryStatus(id: string): Promise<Category> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockCategories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Category not found');
  }

  const updated: Category = {
    ...mockCategories[index],
    isActive: !mockCategories[index].isActive,
    updatedAt: new Date().toISOString(),
  };

  mockCategories[index] = updated;
  return updated;
}

// ——— Unified API (mock vs real) ———

export type GetCategoriesParams = {
  status?: 'all' | 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
};

export async function getCategories(params?: GetCategoriesParams): Promise<CategoriesResponse> {
  try {
    return shouldUseMock() ? mockGetCategories(params) : realGetCategories(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function createCategory(payload: {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}): Promise<Category> {
  try {
    return shouldUseMock()
      ? mockCreateCategory(payload)
      : realCreateCategory({
          name: payload.name,
          sortOrder: payload.sortOrder,
          isActive: payload.isActive,
        });
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateCategory(
  id: string,
  payload: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<Category> {
  try {
    if (shouldUseMock()) return mockUpdateCategory(id, payload);
    await realUpdateCategory(id, {
      name: payload.name,
      sortOrder: payload.sortOrder,
      isActive: payload.isActive,
    });
    const list = await realGetCategories({ limit: 100 });
    const found = list.categories.find((c) => c.id === id);
    if (!found) throw new Error('Category not found');
    return { ...found, ...payload, updatedAt: new Date().toISOString() };
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    return shouldUseMock() ? mockDeleteCategory(id) : realDeleteCategory(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function toggleCategoryStatus(id: string): Promise<Category> {
  try {
    if (shouldUseMock()) return mockToggleCategoryStatus(id);
    await realToggleCategoryStatus(id);
    const list = await realGetCategories({ limit: 100 });
    const found = list.categories.find((c) => c.id === id);
    if (!found) throw new Error('Category not found');
    return { ...found, isActive: !found.isActive, updatedAt: new Date().toISOString() };
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
