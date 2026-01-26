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
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: string;
  notes?: string;
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

// Mock orders data
const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => {
  const statuses: Order['status'][] = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'picked_up',
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

export async function mockGetOrders(params?: {
  status?: string;
  paymentStatus?: string;
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

export async function mockGetOrderById(id: string): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const order = mockOrders.find((o) => o.id === id);
  if (!order) throw new Error('Order not found');
  return order;
}

export async function mockUpdateOrderStatus(
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

export async function mockAssignDriver(orderId: string, driverId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const order = mockOrders.find((o) => o.id === orderId);
  if (order) {
    order.driverId = driverId;
    order.driverName = `سائق ${driverId}`;
    order.updatedAt = new Date().toISOString();
  }
}

