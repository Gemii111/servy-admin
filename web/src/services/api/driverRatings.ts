export interface DriverRating {
  id: string;
  driverId: string;
  driver: {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalRatings?: number;
    averageRating?: number;
    totalDeliveries?: number;
  };
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  orderId: string;
  order: {
    id: string;
    orderNumber: string;
    total: number;
    createdAt: string;
    restaurantName?: string;
    deliveredAt?: string;
  };
  rating: number;
  comment?: string;
  imageUrls?: string[];
  punctualityRating?: number;
  communicationRating?: number;
  serviceQualityRating?: number;
  isHidden: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DriverRatingsStatistics {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
  topDrivers: Array<{
    driverId: string;
    driverName: string;
    averageRating: number;
    totalRatings: number;
  }>;
  lowestDrivers: Array<{
    driverId: string;
    driverName: string;
    averageRating: number;
    totalRatings: number;
  }>;
  recentRatings: Array<{
    id: string;
    driverName: string;
    customerName: string;
    rating: number;
    createdAt: string;
  }>;
}

export interface DriverRatingsResponse {
  ratings: DriverRating[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Mock data
const mockDriverRatings: DriverRating[] = [
  {
    id: 'rating-1',
    driverId: 'driver-1',
    driver: {
      id: 'driver-1',
      name: 'أحمد علي',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      totalRatings: 150,
      averageRating: 4.5,
      totalDeliveries: 500,
    },
    customerId: 'customer-1',
    customer: {
      id: 'customer-1',
      name: 'محمد أحمد',
      email: 'mohammed@example.com',
    },
    orderId: 'order-1',
    order: {
      id: 'order-1',
      orderNumber: 'ORD-12345',
      total: 94.5,
      createdAt: '2024-01-01T12:00:00Z',
      restaurantName: 'مطعم البيتزا',
      deliveredAt: '2024-01-01T12:35:00Z',
    },
    rating: 4.5,
    comment: 'خدمة ممتازة، التزم بالموعد المحدد!',
    punctualityRating: 5.0,
    communicationRating: 4.0,
    serviceQualityRating: 4.5,
    imageUrls: [],
    isHidden: false,
    isDeleted: false,
    createdAt: '2024-01-01T13:00:00Z',
    updatedAt: '2024-01-01T13:00:00Z',
  },
  {
    id: 'rating-2',
    driverId: 'driver-1',
    driver: {
      id: 'driver-1',
      name: 'أحمد علي',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      totalRatings: 150,
      averageRating: 4.5,
      totalDeliveries: 500,
    },
    customerId: 'customer-2',
    customer: {
      id: 'customer-2',
      name: 'خالد محمد',
      email: 'khaled@example.com',
    },
    orderId: 'order-2',
    order: {
      id: 'order-2',
      orderNumber: 'ORD-12346',
      total: 120.0,
      createdAt: '2024-01-02T14:00:00Z',
      restaurantName: 'مطعم البرجر',
      deliveredAt: '2024-01-02T14:30:00Z',
    },
    rating: 5.0,
    comment: 'سائق محترف ومهذب',
    punctualityRating: 5.0,
    communicationRating: 5.0,
    serviceQualityRating: 5.0,
    isHidden: false,
    isDeleted: false,
    createdAt: '2024-01-02T15:00:00Z',
    updatedAt: '2024-01-02T15:00:00Z',
  },
  {
    id: 'rating-3',
    driverId: 'driver-2',
    driver: {
      id: 'driver-2',
      name: 'سعد حسن',
      email: 'saad@example.com',
      phone: '+966502345678',
      totalRatings: 80,
      averageRating: 3.8,
      totalDeliveries: 300,
    },
    customerId: 'customer-3',
    customer: {
      id: 'customer-3',
      name: 'علي أحمد',
      email: 'ali@example.com',
    },
    orderId: 'order-3',
    order: {
      id: 'order-3',
      orderNumber: 'ORD-12347',
      total: 75.0,
      createdAt: '2024-01-03T10:00:00Z',
      restaurantName: 'مطعم الشاورما',
      deliveredAt: '2024-01-03T10:25:00Z',
    },
    rating: 3.5,
    comment: 'تأخر قليلاً لكن الخدمة جيدة',
    punctualityRating: 3.0,
    communicationRating: 4.0,
    serviceQualityRating: 3.5,
    isHidden: false,
    isDeleted: false,
    createdAt: '2024-01-03T11:00:00Z',
    updatedAt: '2024-01-03T11:00:00Z',
  },
];

// Mock API functions
export async function mockGetDriverRatings(params?: {
  driverId?: string;
  customerId?: string;
  orderId?: string;
  minRating?: number;
  maxRating?: number;
  dateFrom?: string;
  dateTo?: string;
  isHidden?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'rating';
  sortOrder?: 'asc' | 'desc';
}): Promise<DriverRatingsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockDriverRatings.filter((r) => !r.isDeleted)];

  if (params?.driverId) {
    filtered = filtered.filter((r) => r.driverId === params.driverId);
  }

  if (params?.customerId) {
    filtered = filtered.filter((r) => r.customerId === params.customerId);
  }

  if (params?.orderId) {
    filtered = filtered.filter((r) => r.orderId === params.orderId);
  }

  if (params?.minRating !== undefined) {
    filtered = filtered.filter((r) => r.rating >= params.minRating!);
  }

  if (params?.maxRating !== undefined) {
    filtered = filtered.filter((r) => r.rating <= params.maxRating!);
  }

  if (params?.dateFrom) {
    filtered = filtered.filter((r) => r.createdAt >= params.dateFrom!);
  }

  if (params?.dateTo) {
    filtered = filtered.filter((r) => r.createdAt <= params.dateTo!);
  }

  if (params?.isHidden !== undefined) {
    filtered = filtered.filter((r) => r.isHidden === params.isHidden);
  }

  // Sort
  if (params?.sortBy) {
    filtered.sort((a, b) => {
      const aValue = params.sortBy === 'rating' ? a.rating : a.createdAt;
      const bValue = params.sortBy === 'rating' ? b.rating : b.createdAt;

      if (params.sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });
  }

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    ratings: filtered.slice(start, end),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function mockGetDriverRatingById(id: string): Promise<DriverRating> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const rating = mockDriverRatings.find((r) => r.id === id);
  if (!rating) {
    throw new Error('Rating not found');
  }

  return rating;
}

export async function mockGetDriverRatingsStatistics(params?: {
  driverId?: string;
  period?: 'today' | 'week' | 'month' | 'year' | 'all';
}): Promise<DriverRatingsStatistics> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockDriverRatings.filter((r) => !r.isDeleted && !r.isHidden)];

  if (params?.driverId) {
    filtered = filtered.filter((r) => r.driverId === params.driverId);
  }

  const totalRatings = filtered.length;
  const averageRating =
    totalRatings > 0
      ? filtered.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

  const ratingDistribution = {
    '5': filtered.filter((r) => r.rating >= 4.5 && r.rating <= 5).length,
    '4': filtered.filter((r) => r.rating >= 3.5 && r.rating < 4.5).length,
    '3': filtered.filter((r) => r.rating >= 2.5 && r.rating < 3.5).length,
    '2': filtered.filter((r) => r.rating >= 1.5 && r.rating < 2.5).length,
    '1': filtered.filter((r) => r.rating >= 1 && r.rating < 1.5).length,
  };

  // Group by driver
  const driverStats = new Map<
    string,
    { driverId: string; driverName: string; ratings: number[] }
  >();

  filtered.forEach((r) => {
    if (!driverStats.has(r.driverId)) {
      driverStats.set(r.driverId, {
        driverId: r.driverId,
        driverName: r.driver.name,
        ratings: [],
      });
    }
    driverStats.get(r.driverId)!.ratings.push(r.rating);
  });

  const topDrivers = Array.from(driverStats.values())
    .map((stats) => ({
      driverId: stats.driverId,
      driverName: stats.driverName,
      averageRating:
        stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length,
      totalRatings: stats.ratings.length,
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10);

  const lowestDrivers = Array.from(driverStats.values())
    .map((stats) => ({
      driverId: stats.driverId,
      driverName: stats.driverName,
      averageRating:
        stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length,
      totalRatings: stats.ratings.length,
    }))
    .filter((d) => d.totalRatings >= 5) // At least 5 ratings
    .sort((a, b) => a.averageRating - b.averageRating)
    .slice(0, 10);

  const recentRatings = filtered
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, 10)
    .map((r) => ({
      id: r.id,
      driverName: r.driver.name,
      customerName: r.customer.name,
      rating: r.rating,
      createdAt: r.createdAt,
    }));

  return {
    totalRatings,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
    topDrivers,
    lowestDrivers,
    recentRatings,
  };
}

export async function mockGetDriverAverageRating(
  driverId: string
): Promise<{
  driverId: string;
  driverName: string;
  averageRating: number;
  totalRatings: number;
  ratingBreakdown?: {
    punctuality: number;
    communication: number;
    serviceQuality: number;
  };
  ratingDistribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const ratings = mockDriverRatings.filter(
    (r) => r.driverId === driverId && !r.isDeleted && !r.isHidden
  );

  if (ratings.length === 0) {
    throw new Error('No ratings found for this driver');
  }

  const driver = ratings[0].driver;
  const averageRating =
    ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

  const punctualityRatings = ratings
    .filter((r) => r.punctualityRating)
    .map((r) => r.punctualityRating!);
  const communicationRatings = ratings
    .filter((r) => r.communicationRating)
    .map((r) => r.communicationRating!);
  const serviceQualityRatings = ratings
    .filter((r) => r.serviceQualityRating)
    .map((r) => r.serviceQualityRating!);

  const ratingBreakdown = {
    punctuality:
      punctualityRatings.length > 0
        ? punctualityRatings.reduce((sum, r) => sum + r, 0) / punctualityRatings.length
        : 0,
    communication:
      communicationRatings.length > 0
        ? communicationRatings.reduce((sum, r) => sum + r, 0) /
          communicationRatings.length
        : 0,
    serviceQuality:
      serviceQualityRatings.length > 0
        ? serviceQualityRatings.reduce((sum, r) => sum + r, 0) /
          serviceQualityRatings.length
        : 0,
  };

  const ratingDistribution = {
    '5': ratings.filter((r) => r.rating >= 4.5 && r.rating <= 5).length,
    '4': ratings.filter((r) => r.rating >= 3.5 && r.rating < 4.5).length,
    '3': ratings.filter((r) => r.rating >= 2.5 && r.rating < 3.5).length,
    '2': ratings.filter((r) => r.rating >= 1.5 && r.rating < 2.5).length,
    '1': ratings.filter((r) => r.rating >= 1 && r.rating < 1.5).length,
  };

  return {
    driverId,
    driverName: driver.name,
    averageRating: Math.round(averageRating * 10) / 10,
    totalRatings: ratings.length,
    ratingBreakdown: {
      punctuality: Math.round(ratingBreakdown.punctuality * 10) / 10,
      communication: Math.round(ratingBreakdown.communication * 10) / 10,
      serviceQuality: Math.round(ratingBreakdown.serviceQuality * 10) / 10,
    },
    ratingDistribution,
  };
}

export async function mockHideDriverRating(
  id: string,
  data: { isHidden: boolean; reason?: string }
): Promise<DriverRating> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockDriverRatings.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error('Rating not found');
  }

  mockDriverRatings[index] = {
    ...mockDriverRatings[index],
    isHidden: data.isHidden,
    updatedAt: new Date().toISOString(),
  };

  return mockDriverRatings[index];
}

export async function mockDeleteDriverRating(
  id: string,
  reason?: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockDriverRatings.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error('Rating not found');
  }

  mockDriverRatings[index] = {
    ...mockDriverRatings[index],
    isDeleted: true,
    updatedAt: new Date().toISOString(),
  };
}

