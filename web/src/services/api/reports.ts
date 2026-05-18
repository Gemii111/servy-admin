import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  restaurantId?: string;
  status?: string;
}

export interface SalesReport {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalDeliveryFees: number;
  totalTax: number;
  netRevenue: number;
  ordersByStatus: {
    status: string;
    count: number;
    revenue: number;
  }[];
}

export interface RestaurantReport {
  restaurantId: string;
  restaurantName: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
}

export interface DriverReport {
  driverId: string;
  driverName: string;
  totalDeliveries: number;
  completedDeliveries: number;
  averageDeliveryTime: number; // in minutes
  totalEarnings: number;
  rating: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueByRestaurant {
  restaurantName: string;
  revenue: number;
  orders: number;
  percentage: number;
}

// Mock Sales Report
export async function mockGetSalesReport(
  filters?: ReportFilters
): Promise<SalesReport> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const totalOrders = Math.floor(Math.random() * 5000) + 2000;
  const totalRevenue = Math.floor(Math.random() * 500000) + 200000;
  const averageOrderValue = Math.round(totalRevenue / totalOrders);

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    totalDeliveryFees: Math.round(totalOrders * 15),
    totalTax: Math.round(totalRevenue * 0.15),
    netRevenue: Math.round(totalRevenue * 0.85),
    ordersByStatus: [
      { status: 'مكتملة', count: Math.round(totalOrders * 0.75), revenue: Math.round(totalRevenue * 0.75) },
      { status: 'قيد التحضير', count: Math.round(totalOrders * 0.12), revenue: Math.round(totalRevenue * 0.12) },
      { status: 'قيد التوصيل', count: Math.round(totalOrders * 0.08), revenue: Math.round(totalRevenue * 0.08) },
      { status: 'ملغاة', count: Math.round(totalOrders * 0.05), revenue: 0 },
    ],
  };
}

// Mock Restaurant Reports
export async function mockGetRestaurantReports(
  filters?: ReportFilters
): Promise<RestaurantReport[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const restaurants = [
    'مطعم الشام',
    'بيتزا هت',
    'كنتاكي',
    'ماكدونالدز',
    'برجر كنج',
    'دومينوز',
    'سوبواي',
    'كافيه نيوم',
  ];

  return restaurants.map((name, index) => {
    const totalOrders = Math.floor(Math.random() * 500) + 100;
    const totalRevenue = Math.floor(Math.random() * 50000) + 10000;
    return {
      restaurantId: `restaurant-${index + 1}`,
      restaurantName: name,
      totalOrders,
      totalRevenue,
      averageOrderValue: Math.round(totalRevenue / totalOrders),
      completionRate: Math.random() * 0.2 + 0.8, // 80-100%
    };
  });
}

// Mock Driver Reports
export async function mockGetDriverReports(
  filters?: ReportFilters
): Promise<DriverReport[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return Array.from({ length: 10 }, (_, i) => {
    const totalDeliveries = Math.floor(Math.random() * 200) + 50;
    const completedDeliveries = Math.floor(totalDeliveries * (0.85 + Math.random() * 0.15));
    return {
      driverId: `driver-${i + 1}`,
      driverName: `سائق ${i + 1}`,
      totalDeliveries,
      completedDeliveries,
      averageDeliveryTime: Math.floor(Math.random() * 20) + 25, // 25-45 minutes
      totalEarnings: Math.floor(completedDeliveries * (15 + Math.random() * 10)),
      rating: Number((Math.random() * 1 + 4).toFixed(1)), // 4.0-5.0
    };
  }).sort((a, b) => b.totalDeliveries - a.totalDeliveries);
}

// Mock Revenue by Day (last 30 days)
export async function mockGetRevenueByDay(
  filters?: ReportFilters
): Promise<RevenueByDay[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const days: RevenueByDay[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 10000) + 5000,
      orders: Math.floor(Math.random() * 100) + 50,
    });
  }
  return days;
}

// Mock Revenue by Restaurant
export async function mockGetRevenueByRestaurant(
  filters?: ReportFilters
): Promise<RevenueByRestaurant[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const restaurants = [
    { name: 'مطعم الشام', revenue: 125000, orders: 1250 },
    { name: 'بيتزا هت', revenue: 98000, orders: 980 },
    { name: 'كنتاكي', revenue: 85000, orders: 850 },
    { name: 'ماكدونالدز', revenue: 72000, orders: 720 },
    { name: 'برجر كنج', revenue: 65000, orders: 650 },
    { name: 'دومينوز', revenue: 55000, orders: 550 },
    { name: 'سوبواي', revenue: 48000, orders: 480 },
    { name: 'كافيه نيوم', revenue: 42000, orders: 420 },
  ];

  const totalRevenue = restaurants.reduce((sum, r) => sum + r.revenue, 0);

  return restaurants.map((r) => ({
    restaurantName: r.name,
    revenue: r.revenue,
    orders: r.orders,
    percentage: Number(((r.revenue / totalRevenue) * 100).toFixed(1)),
  }));
}

function reportParams(filters?: ReportFilters): Record<string, string> {
  const p: Record<string, string> = {};
  if (filters?.startDate) p.date_from = filters.startDate;
  if (filters?.endDate) p.date_to = filters.endDate;
  if (filters?.restaurantId) p.restaurant_id = filters.restaurantId;
  if (filters?.status) p.status = filters.status;
  return p;
}

async function realGetSalesReport(filters?: ReportFilters): Promise<SalesReport> {
  const { data } = await apiClient.get<SalesReport>('/admin/reports/orders', {
    params: reportParams(filters),
  });
  return (data as { data?: SalesReport }).data ?? data;
}

async function realGetRestaurantReports(filters?: ReportFilters): Promise<RestaurantReport[]> {
  const { data } = await apiClient.get<{ restaurants?: RestaurantReport[] }>(
    '/admin/reports/revenue',
    { params: reportParams(filters) }
  );
  return data.restaurants ?? (Array.isArray(data) ? (data as RestaurantReport[]) : []);
}

async function realGetDriverReports(filters?: ReportFilters): Promise<DriverReport[]> {
  const { data } = await apiClient.get<{ drivers?: DriverReport[] }>('/admin/reports/drivers', {
    params: reportParams(filters),
  });
  return data.drivers ?? [];
}

async function realGetRevenueByDay(filters?: ReportFilters): Promise<RevenueByDay[]> {
  const { data } = await apiClient.get<{ days?: RevenueByDay[] }>('/admin/reports/revenue-by-day', {
    params: reportParams(filters),
  });
  return data.days ?? [];
}

async function realGetRevenueByRestaurant(
  filters?: ReportFilters
): Promise<RevenueByRestaurant[]> {
  const reports = await realGetRestaurantReports(filters);
  const total = reports.reduce((s, r) => s + r.totalRevenue, 0) || 1;
  return reports.map((r) => ({
    restaurantName: r.restaurantName,
    revenue: r.totalRevenue,
    orders: r.totalOrders,
    percentage: Number(((r.totalRevenue / total) * 100).toFixed(1)),
  }));
}

export async function getSalesReport(filters?: ReportFilters): Promise<SalesReport> {
  try {
    return shouldUseMock() ? mockGetSalesReport(filters) : realGetSalesReport(filters);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getRestaurantReports(filters?: ReportFilters): Promise<RestaurantReport[]> {
  try {
    return shouldUseMock() ? mockGetRestaurantReports(filters) : realGetRestaurantReports(filters);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getDriverReports(filters?: ReportFilters): Promise<DriverReport[]> {
  try {
    return shouldUseMock() ? mockGetDriverReports(filters) : realGetDriverReports(filters);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getRevenueByDay(filters?: ReportFilters): Promise<RevenueByDay[]> {
  try {
    return shouldUseMock() ? mockGetRevenueByDay(filters) : realGetRevenueByDay(filters);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getRevenueByRestaurant(
  filters?: ReportFilters
): Promise<RevenueByRestaurant[]> {
  try {
    return shouldUseMock()
      ? mockGetRevenueByRestaurant(filters)
      : realGetRevenueByRestaurant(filters);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function downloadReportExport(
  type: 'orders' | 'revenue' | 'drivers',
  filters?: ReportFilters
): Promise<void> {
  const res = await apiClient.get('/admin/reports/export', {
    params: {
      type,
      format: 'csv',
      ...reportParams(filters),
    },
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${type}-${filters?.startDate ?? 'all'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportReportToCsv(filename: string, rows: Record<string, string | number>[]): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

