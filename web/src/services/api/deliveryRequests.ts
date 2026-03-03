/**
 * Delivery Requests (P2P) API Service
 * طلبات التوصيل المباشرة حسب ADMIN_APPLICATION_REQUIREMENTS.md
 */

export interface DeliveryAddress {
  label: string;
  address_line: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface DeliveryRequest {
  id: string;
  user_id: string;
  pickup_address: DeliveryAddress;
  delivery_address: DeliveryAddress;
  receiver_name: string;
  receiver_phone: string;
  item_description: string;
  payment_method: 'cash' | 'card' | 'wallet';
  status: 'pending' | 'accepted' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled';
  fee?: number;
  notes?: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'معلق',
  accepted: 'مقبول',
  picked_up: 'تم الاستلام',
  delivering: 'قيد التوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

// Mock data
const mockDeliveryRequests: DeliveryRequest[] = [
  {
    id: '1',
    user_id: 'u1',
    pickup_address: {
      label: 'Pickup',
      address_line: 'شارع التحرير',
      city: 'القاهرة',
      latitude: 30.0,
      longitude: 31.0,
    },
    delivery_address: {
      label: 'Delivery',
      address_line: 'شارع الهرم',
      city: 'الجيزة',
      latitude: 30.1,
      longitude: 31.1,
    },
    receiver_name: 'أحمد محمد',
    receiver_phone: '+201012345678',
    item_description: 'مستندات هامة',
    payment_method: 'cash',
    status: 'delivering',
    fee: 35,
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'u2',
    pickup_address: {
      label: 'Pickup',
      address_line: 'مدينة نصر',
      city: 'القاهرة',
      latitude: 30.05,
      longitude: 31.35,
    },
    delivery_address: {
      label: 'Delivery',
      address_line: 'المعادي',
      city: 'القاهرة',
      latitude: 29.96,
      longitude: 31.25,
    },
    receiver_name: 'سارة علي',
    receiver_phone: '+201098765432',
    item_description: 'هدية',
    payment_method: 'cash',
    status: 'pending',
    fee: 45,
    created_at: '2026-03-02T14:30:00Z',
  },
];

export const getDeliveryRequestStatusLabel = (status: string) =>
  STATUS_LABELS[status] || status;

export async function mockGetDeliveryRequests(params?: {
  status?: string;
}): Promise<DeliveryRequest[]> {
  await new Promise((r) => setTimeout(r, 300));
  let result = [...mockDeliveryRequests];
  if (params?.status && params.status !== 'all') {
    result = result.filter((d) => d.status === params.status);
  }
  return result;
}

export async function mockGetDeliveryRequestById(id: string): Promise<DeliveryRequest | null> {
  await new Promise((r) => setTimeout(r, 200));
  return mockDeliveryRequests.find((d) => d.id === id) || null;
}

export async function mockCancelDeliveryRequest(id: string): Promise<DeliveryRequest> {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockDeliveryRequests.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error('طلب التوصيل غير موجود');
  mockDeliveryRequests[idx].status = 'cancelled';
  return mockDeliveryRequests[idx];
}
