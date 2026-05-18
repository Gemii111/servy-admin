/**
 * Menu oversight API — Handoff §8 (Menu oversight)
 */

import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

export interface MenuItemOversight {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category?: string;
  category_id?: string;
  restaurant_id: string;
  restaurant_name?: string;
}

export interface MenuCategoryGroup {
  id: string;
  name: string;
  rank?: string;
  items: MenuItemOversight[];
}

export interface RestaurantMenuResponse {
  categories: MenuCategoryGroup[];
  items: MenuItemOversight[];
}

function mapMenuItem(
  raw: Record<string, unknown>,
  restaurantId: string,
  categoryName?: string
): MenuItemOversight {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: raw.description != null ? String(raw.description) : undefined,
    price: Number(raw.price ?? 0),
    image_url:
      raw.image_url != null
        ? String(raw.image_url)
        : raw.imageUrl != null
          ? String(raw.imageUrl)
          : undefined,
    is_available: Boolean(raw.is_available ?? raw.isAvailable ?? true),
    category: categoryName ?? (raw.category != null ? String(raw.category) : undefined),
    category_id:
      raw.category_id != null
        ? String(raw.category_id)
        : raw.categoryId != null
          ? String(raw.categoryId)
          : undefined,
    restaurant_id: restaurantId,
  };
}

function parseMenuResponse(data: unknown, restaurantId: string): RestaurantMenuResponse {
  const body = (data as { items?: unknown[] }) ?? {};
  const top = body.items ?? [];

  if (!Array.isArray(top) || top.length === 0) {
    return { categories: [], items: [] };
  }

  const first = top[0] as Record<string, unknown>;
  const nestedCategories =
    first.items != null || (first.rank != null && first.name != null && first.price == null);

  if (nestedCategories) {
    const categories: MenuCategoryGroup[] = (top as Record<string, unknown>[]).map((cat) => {
      const catName = String(cat.name ?? '');
      const nested = (cat.items as Record<string, unknown>[] | undefined) ?? [];
      return {
        id: String(cat.id ?? catName),
        name: catName,
        rank: cat.rank != null ? String(cat.rank) : undefined,
        items: nested.map((item) => mapMenuItem(item, restaurantId, catName)),
      };
    });
    return { categories, items: categories.flatMap((c) => c.items) };
  }

  const items = (top as Record<string, unknown>[]).map((item) => mapMenuItem(item, restaurantId));
  return { categories: [], items };
}

const mockMenuItems: MenuItemOversight[] = [
  {
    id: 'm1',
    name: 'شاورما',
    price: 75,
    is_available: true,
    category: 'وجبات',
    restaurant_id: 'r1',
    restaurant_name: 'مطعم النيل',
  },
  {
    id: 'm2',
    name: 'كولا',
    price: 15,
    is_available: false,
    category: 'مشروبات',
    restaurant_id: 'r1',
    restaurant_name: 'مطعم النيل',
  },
];

async function realGetRestaurantMenu(restaurantId: string): Promise<RestaurantMenuResponse> {
  const res = await apiClient.get(`/admin/restaurants/${restaurantId}/menu`);
  const payload = (res.data as { data?: unknown }).data ?? res.data;
  return parseMenuResponse(payload, restaurantId);
}

async function realSetMenuItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<void> {
  await apiClient.put(`/admin/menu/items/${itemId}/availability`, {
    is_available: isAvailable,
  });
}

async function mockGetRestaurantMenu(restaurantId: string): Promise<RestaurantMenuResponse> {
  await new Promise((r) => setTimeout(r, 250));
  const items = mockMenuItems.filter(
    (m) => m.restaurant_id === restaurantId || restaurantId === 'r1'
  );
  return {
    categories: [
      {
        id: 'cat-mock',
        name: 'القائمة',
        items,
      },
    ],
    items,
  };
}

async function mockSetMenuItemAvailability(itemId: string, isAvailable: boolean): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  const item = mockMenuItems.find((m) => m.id === itemId);
  if (item) item.is_available = isAvailable;
}

export async function getRestaurantMenu(restaurantId: string): Promise<RestaurantMenuResponse> {
  try {
    return shouldUseMock()
      ? mockGetRestaurantMenu(restaurantId)
      : realGetRestaurantMenu(restaurantId);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function setMenuItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<void> {
  try {
    return shouldUseMock()
      ? mockSetMenuItemAvailability(itemId, isAvailable)
      : realSetMenuItemAvailability(itemId, isAvailable);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
