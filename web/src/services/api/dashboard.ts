export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeRestaurants: number;
  activeDrivers: number;
  pendingOrders: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface TopRestaurant {
  name: string;
  orders: number;
  revenue: number;
}

// Mock statistics data
export async function mockGetDashboardStatistics(): Promise<DashboardStats> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    totalUsers: 5000,
    totalOrders: 25000,
    totalRevenue: 500000,
    activeRestaurants: 450,
    activeDrivers: 200,
    pendingOrders: 25,
  };
}

// Mock orders over time (last 7 days)
export async function mockGetOrdersOverTime(): Promise<ChartDataPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  return days.map((day, index) => ({
    date: day,
    value: Math.floor(Math.random() * 200) + 100 + index * 10,
  }));
}

// Mock revenue over time (last 7 days)
export async function mockGetRevenueOverTime(): Promise<ChartDataPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  return days.map((day, index) => ({
    date: day,
    value: Math.floor(Math.random() * 5000) + 2000 + index * 500,
  }));
}

// Mock orders by status
export async function mockGetOrdersByStatus(): Promise<OrdersByStatus[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    { status: 'مكتملة', count: 18500 },
    { status: 'قيد التحضير', count: 3200 },
    { status: 'قيد التوصيل', count: 1800 },
    { status: 'ملغاة', count: 1500 },
    { status: 'معلقة', count: 500 },
  ];
}

// Mock top restaurants
export async function mockGetTopRestaurants(): Promise<TopRestaurant[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    { name: 'مطعم الشام', orders: 1250, revenue: 125000 },
    { name: 'بيتزا هت', orders: 980, revenue: 98000 },
    { name: 'كنتاكي', orders: 850, revenue: 85000 },
    { name: 'ماكدونالدز', orders: 720, revenue: 72000 },
    { name: 'برجر كنج', orders: 650, revenue: 65000 },
  ];
}
