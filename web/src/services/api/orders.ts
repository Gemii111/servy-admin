import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock, cleanListQueryParams } from './base';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  driverId?: string;
  driverName?: string;
  status:
    | 'pending'
    | 'accepted'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'heading_to_restaurant'
    | 'at_restaurant'
    | 'picked_up'
    | 'out_for_delivery'
    | 'delivering'
    | 'delivered'
    | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: string;
  notes?: string;
  orderType?: OrderType;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId?: string;
  restaurantName?: string;
  driverId?: string;
  driverName?: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  notes?: string;
  orderType?: string;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
}

export type OrderType = 'vendor' | 'p2p';

export interface OrderTrackingTimelineItem {
  status: string;
  label?: string;
  timestamp: string;
  note?: string;
}

export interface OrderTrackingDetail {
  order_id: string;
  status: string;
  estimated_time?: {
    min_minutes: number;
    max_minutes: number;
    is_delayed?: boolean;
  };
  status_timeline: OrderTrackingTimelineItem[];
  rider_info?: {
    rider_id: string;
    name: string;
    phone: string;
    vehicle?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  delivery_address?: {
    address_line?: string;
    latitude?: number;
    longitude?: number;
  };
}

function mapApiOrderFromRaw(raw: Record<string, unknown>): Order {
  const items = (raw.items as OrderItem[] | undefined) ?? [];
  return {
    id: String(raw.id ?? ''),
    orderNumber: String(raw.orderNumber ?? raw.order_number ?? ''),
    customerId: String(raw.customerId ?? raw.customer_id ?? ''),
    customerName: String(raw.customerName ?? raw.customer_name ?? ''),
    customerPhone: String(raw.customerPhone ?? raw.customer_phone ?? ''),
    restaurantId: String(raw.restaurantId ?? raw.restaurant_id ?? ''),
    restaurantName: String(raw.restaurantName ?? raw.restaurant_name ?? '-'),
    driverId: raw.driverId != null ? String(raw.driverId) : raw.driver_id != null ? String(raw.driver_id) : undefined,
    driverName: raw.driverName != null ? String(raw.driverName) : raw.driver_name != null ? String(raw.driver_name) : undefined,
    status: String(raw.status ?? 'pending') as Order['status'],
    items,
    subtotal: Number(raw.subtotal ?? 0),
    deliveryFee: Number(raw.deliveryFee ?? raw.delivery_fee ?? 0),
    tax: Number(raw.tax ?? raw.discount ?? 0),
    total: Number(raw.total ?? 0),
    paymentMethod: String(raw.paymentMethod ?? raw.payment_method ?? 'cash') as Order['paymentMethod'],
    paymentStatus: String(raw.paymentStatus ?? raw.payment_status ?? 'pending') as Order['paymentStatus'],
    deliveryAddress: String(raw.deliveryAddress ?? raw.delivery_address ?? ''),
    notes: raw.notes != null ? String(raw.notes) : undefined,
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? raw.createdAt ?? raw.created_at ?? ''),
    orderType: (String(raw.orderType ?? raw.order_type ?? 'vendor') as OrderType) || 'vendor',
  };
}

function mapApiOrderToOrder(api: ApiOrder): Order {
  return mapApiOrderFromRaw(api as unknown as Record<string, unknown>);
}

function unwrapOrderPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const envelope = data as Record<string, unknown>;
  if (envelope.data && typeof envelope.data === 'object' && !Array.isArray(envelope.data)) {
    return envelope.data as Record<string, unknown>;
  }
  if (envelope.order && typeof envelope.order === 'object') {
    return envelope.order as Record<string, unknown>;
  }
  return envelope;
}

async function realGetOrders(params?: {
  status?: string;
  paymentStatus?: string;
  restaurantId?: string;
  orderType?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<OrdersResponse> {
  const cleaned = cleanListQueryParams({
    status: params?.status,
    paymentStatus: params?.paymentStatus,
    restaurantId: params?.restaurantId,
    orderType: params?.orderType,
    search: params?.search,
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  });

  const { data } = await apiClient.get<{ orders: ApiOrder[]; pagination: OrdersResponse['pagination'] }>(
    '/admin/orders',
    { params: cleaned }
  );
  return {
    orders: (data.orders || []).map(mapApiOrderToOrder),
    pagination: data.pagination,
  };
}

async function realGetOrderById(id: string): Promise<Order> {
  const { data } = await apiClient.get(`/admin/orders/${id}`);
  return mapApiOrderFromRaw(unwrapOrderPayload(data));
}

async function realUpdateOrderStatus(id: string, status: Order['status']): Promise<void> {
  await apiClient.put(`/admin/orders/${id}/status`, {
    status,
    Status: status,
  });
}

async function realAssignDriver(orderId: string, driverId: string): Promise<void> {
  await apiClient.post(`/admin/orders/${orderId}/assign-driver`, { driverId });
}

async function realCancelOrder(id: string, reason?: string): Promise<void> {
  const body = reason?.trim() ? { reason: reason.trim() } : {};
  await apiClient.post(`/admin/orders/${id}/cancel`, body);
}

function parseTimelineTimestamp(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const str = String(value).trim();
  if (!str) return null;
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function mapTrackingTimelineItem(raw: unknown): OrderTrackingTimelineItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const timestamp = parseTimelineTimestamp(
    r.timestamp ?? r.created_at ?? r.createdAt ?? r.time ?? r.date
  );
  if (!timestamp) return null;
  const status = String(r.status ?? '');
  if (!status) return null;
  return {
    status,
    label: r.label != null ? String(r.label) : undefined,
    timestamp,
    note: r.note != null ? String(r.note) : undefined,
  };
}

function mapTrackingTimeline(list: unknown): OrderTrackingTimelineItem[] {
  if (!Array.isArray(list)) return [];
  return list
    .map(mapTrackingTimelineItem)
    .filter((item): item is OrderTrackingTimelineItem => item != null);
}

function mapOrderTrackingDetail(raw: Record<string, unknown>, orderId: string): OrderTrackingDetail {
  const eta = raw.estimated_time ?? raw.estimatedTime;
  const etaObj =
    eta && typeof eta === 'object'
      ? (eta as Record<string, unknown>)
      : null;

  return {
    order_id: String(raw.order_id ?? raw.orderId ?? orderId),
    status: String(raw.status ?? ''),
    estimated_time: etaObj
      ? {
          min_minutes: Number(etaObj.min_minutes ?? etaObj.minMinutes ?? 0),
          max_minutes: Number(etaObj.max_minutes ?? etaObj.maxMinutes ?? 0),
          is_delayed: Boolean(etaObj.is_delayed ?? etaObj.isDelayed ?? false),
        }
      : undefined,
    status_timeline: mapTrackingTimeline(
      raw.status_timeline ?? raw.statusTimeline ?? raw.timeline
    ),
    rider_info: (raw.rider_info ?? raw.riderInfo ?? null) as OrderTrackingDetail['rider_info'],
    delivery_address: (raw.delivery_address ??
      raw.deliveryAddress) as OrderTrackingDetail['delivery_address'],
  };
}

async function realGetOrderTracking(id: string): Promise<OrderTrackingDetail> {
  const { data } = await apiClient.get(`/admin/orders/${id}/tracking`);
  const envelope = data as { data?: Record<string, unknown> };
  const body =
    envelope?.data && typeof envelope.data === 'object'
      ? envelope.data
      : (data as Record<string, unknown>);
  return mapOrderTrackingDetail(body, id);
}

async function mockCancelOrder(id: string, reason?: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  const order = mockOrders.find((o) => o.id === id);
  if (order) {
    order.status = 'cancelled';
    order.notes = reason;
  }
}

async function mockGetOrderTracking(id: string): Promise<OrderTrackingDetail> {
  await new Promise((r) => setTimeout(r, 200));
  const order = mockOrders.find((o) => o.id === id);
  if (!order) {
    return { order_id: id, status: 'unknown', status_timeline: [], rider_info: null };
  }
  return {
    order_id: id,
    status: order.status,
    estimated_time: { min_minutes: 15, max_minutes: 25, is_delayed: false },
    status_timeline: [
      { status: 'pending', label: 'قيد الانتظار', timestamp: order.createdAt },
      {
        status: order.status,
        label: order.status,
        timestamp: order.updatedAt || order.createdAt,
      },
    ],
    rider_info: order.driverName
      ? {
          rider_id: order.driverId || 'r1',
          name: order.driverName,
          phone: '+201000000000',
          vehicle: 'motorcycle',
          latitude: 30.05,
          longitude: 31.23,
        }
      : null,
    delivery_address: { address_line: order.deliveryAddress },
  };
}

export async function getOrders(params?: Parameters<typeof realGetOrders>[0]): Promise<OrdersResponse> {
  try {
    return shouldUseMock() ? mockGetOrders(params) : realGetOrders(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getOrderById(id: string): Promise<Order> {
  try {
    return shouldUseMock() ? mockGetOrderById(id) : realGetOrderById(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  try {
    return shouldUseMock() ? mockUpdateOrderStatus(id, status) : realUpdateOrderStatus(id, status);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function assignDriver(orderId: string, driverId: string): Promise<void> {
  try {
    return shouldUseMock() ? mockAssignDriver(orderId, driverId) : realAssignDriver(orderId, driverId);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function cancelOrder(id: string, reason?: string): Promise<void> {
  try {
    return shouldUseMock() ? mockCancelOrder(id, reason) : realCancelOrder(id, reason);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getOrderTracking(id: string): Promise<OrderTrackingDetail> {
  try {
    return shouldUseMock() ? mockGetOrderTracking(id) : realGetOrderTracking(id);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

// Mock orders data
const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => {
  const statuses: Order['status'][] = [
    'pending',
    'accepted',
    'preparing',
    'ready',
    'heading_to_restaurant',
    'at_restaurant',
    'picked_up',
    'out_for_delivery',
    'delivering',
    'delivered',
    'cancelled',
  ];
  const paymentMethods: Order['paymentMethod'][] = ['cash', 'card', 'online'];
  const paymentStatuses: Order['paymentStatus'][] = ['pending', 'paid', 'failed', 'refunded'];

  const subtotal = Math.floor(Math.random() * 200) + 50;
  const deliveryFee = 15;
  const tax = Math.round(subtotal * 0.15);
  const total = subtotal + deliveryFee + tax;

  return {
    id: `order-${i + 1}`,
    orderNumber: `ORD-${String(i + 1).padStart(6, '0')}`,
    customerId: `customer-${Math.floor(Math.random() * 20) + 1}`,
    customerName: `عميل ${i + 1}`,
    customerPhone: `+966501234${String(i).padStart(3, '0')}`,
    restaurantId: `restaurant-${Math.floor(Math.random() * 10) + 1}`,
    restaurantName: `مطعم ${['الشام', 'بيتزا هت', 'كنتاكي', 'ماكدونالدز'][i % 4]}`,
    driverId: i % 3 === 0 ? undefined : `driver-${Math.floor(Math.random() * 5) + 1}`,
    driverName: i % 3 === 0 ? undefined : `سائق ${Math.floor(Math.random() * 5) + 1}`,
    status: statuses[i % statuses.length],
    items: [
      {
        id: `item-${i}-1`,
        menuItemId: `menu-${i}-1`,
        name: `صنف ${i + 1}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: Math.floor(Math.random() * 50) + 20,
        total: 0,
      },
      {
        id: `item-${i}-2`,
        menuItemId: `menu-${i}-2`,
        name: `صنف ${i + 2}`,
        quantity: 1,
        price: Math.floor(Math.random() * 30) + 15,
        total: 0,
      },
    ].map((item) => ({ ...item, total: item.price * item.quantity })),
    subtotal,
    deliveryFee,
    tax,
    total,
    paymentMethod: paymentMethods[i % paymentMethods.length],
    paymentStatus: paymentStatuses[i % paymentStatuses.length],
    deliveryAddress: `شارع ${i + 1}, الرياض`,
    notes: i % 5 === 0 ? 'ملاحظات خاصة' : undefined,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: i % 2 === 0 ? '30-45 دقيقة' : undefined,
  };
});

async function mockGetOrders(params?: {
  status?: string;
  paymentStatus?: string;
  restaurantId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<OrdersResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...mockOrders];

  // Filter by status
  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((o) => o.status === params.status);
  }

  // Filter by payment status
  if (params?.paymentStatus && params.paymentStatus !== 'all') {
    filtered = filtered.filter((o) => o.paymentStatus === params.paymentStatus);
  }

  // Filter by restaurant
  if (params?.restaurantId && params.restaurantId !== 'all') {
    filtered = filtered.filter((o) => o.restaurantId === params.restaurantId);
  }

  // Search
  if (params?.search) {
    const query = params.search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.restaurantName.toLowerCase().includes(query) ||
        o.customerPhone.includes(query)
    );
  }

  // Sort by createdAt (newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    orders: filtered.slice(start, end),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

async function mockGetOrderById(id: string): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const order = mockOrders.find((o) => o.id === id);
  if (!order) throw new Error('Order not found');
  return order;
}

async function mockUpdateOrderStatus(
  id: string,
  status: Order['status']
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const order = mockOrders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
  }
}

async function mockAssignDriver(orderId: string, driverId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const order = mockOrders.find((o) => o.id === orderId);
  if (order) {
    order.driverId = driverId;
    order.driverName = `سائق ${driverId}`;
    order.updatedAt = new Date().toISOString();
  }
}

