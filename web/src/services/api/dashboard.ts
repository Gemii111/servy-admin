import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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

const STATUS_LABELS: Record<string, string> = {
  pending: 'معلق',
  accepted: 'مقبول',
  preparing: 'قيد التحضير',
  ready: 'جاهز',
  out_for_delivery: 'في التوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

function unwrapResponse<T>(data: unknown): T {
  const d = data as { success?: boolean; data?: T };
  return d?.data ?? (data as T);
}

async function realGetDashboardStatistics(): Promise<DashboardStats> {
  const { data } = await apiClient.get('/admin/dashboard/statistics');
  return unwrapResponse<DashboardStats>(data) as DashboardStats;
}

async function realGetOrdersOverTime(): Promise<ChartDataPoint[]> {
  const { data } = await apiClient.get<ChartDataPoint[]>('/admin/dashboard/orders-over-time');
  const arr = Array.isArray(data) ? data : (unwrapResponse<ChartDataPoint[]>(data) ?? []);
  return arr.map((p) => ({
    date: p.date?.length === 10 ? format(new Date(p.date), 'EEE', { locale: ar }) : p.date,
    value: p.value,
  }));
}

async function realGetRevenueOverTime(): Promise<ChartDataPoint[]> {
  const { data } = await apiClient.get<ChartDataPoint[]>('/admin/dashboard/revenue-over-time');
  const arr = Array.isArray(data) ? data : (unwrapResponse<ChartDataPoint[]>(data) ?? []);
  return arr.map((p) => ({
    date: p.date?.length === 10 ? format(new Date(p.date), 'EEE', { locale: ar }) : p.date,
    value: p.value,
  }));
}

async function realGetOrdersByStatus(): Promise<OrdersByStatus[]> {
  const { data } = await apiClient.get<OrdersByStatus[]>('/admin/dashboard/orders-by-status');
  const arr = Array.isArray(data) ? data : (unwrapResponse<OrdersByStatus[]>(data) ?? []);
  return arr.map((p) => ({
    status: STATUS_LABELS[p.status] || p.status,
    count: p.count,
  }));
}

async function realGetTopRestaurants(): Promise<TopRestaurant[]> {
  const { data } = await apiClient.get<TopRestaurant[]>('/admin/dashboard/top-restaurants');
  return Array.isArray(data) ? data : (unwrapResponse<TopRestaurant[]>(data) ?? []);
}

export async function getDashboardStatistics(): Promise<DashboardStats> {
  try {
    return shouldUseMock() ? mockGetDashboardStatistics() : realGetDashboardStatistics();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getOrdersOverTime(): Promise<ChartDataPoint[]> {
  try {
    return shouldUseMock() ? mockGetOrdersOverTime() : realGetOrdersOverTime();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getRevenueOverTime(): Promise<ChartDataPoint[]> {
  try {
    return shouldUseMock() ? mockGetRevenueOverTime() : realGetRevenueOverTime();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getOrdersByStatus(): Promise<OrdersByStatus[]> {
  try {
    return shouldUseMock() ? mockGetOrdersByStatus() : realGetOrdersByStatus();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getTopRestaurants(): Promise<TopRestaurant[]> {
  try {
    return shouldUseMock() ? mockGetTopRestaurants() : realGetTopRestaurants();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

// Mock statistics data
async function mockGetDashboardStatistics(): Promise<DashboardStats> {
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
async function mockGetOrdersOverTime(): Promise<ChartDataPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  return days.map((day, index) => ({
    date: day,
    value: Math.floor(Math.random() * 200) + 100 + index * 10,
  }));
}

// Mock revenue over time (last 7 days)
async function mockGetRevenueOverTime(): Promise<ChartDataPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  return days.map((day, index) => ({
    date: day,
    value: Math.floor(Math.random() * 5000) + 2000 + index * 500,
  }));
}

// Mock orders by status
async function mockGetOrdersByStatus(): Promise<OrdersByStatus[]> {
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
async function mockGetTopRestaurants(): Promise<TopRestaurant[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    { name: 'مطعم الشام', orders: 1250, revenue: 125000 },
    { name: 'بيتزا هت', orders: 980, revenue: 98000 },
    { name: 'كنتاكي', orders: 850, revenue: 85000 },
    { name: 'ماكدونالدز', orders: 720, revenue: 72000 },
    { name: 'برجر كنج', orders: 650, revenue: 65000 },
  ];
}
