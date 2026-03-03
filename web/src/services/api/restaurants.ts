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

