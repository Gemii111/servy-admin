import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'promotion';
export type NotificationPriority = 'low' | 'medium' | 'high';
export type TargetAudience = 'all' | 'customers' | 'drivers' | 'restaurants' | 'specific';
export type NotificationStatus = 'sent' | 'scheduled' | 'failed' | 'draft';

export interface Notification {
  id: string;
  adminId: string;
  adminName: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  targetAudience: TargetAudience;
  userIds?: string[];
  scheduledAt?: string;
  sentAt?: string;
  sentCount: number;
  deliveryStatus: {
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  isDraft: boolean;
  status: NotificationStatus;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  adminId: string;
  name: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  targetAudience: TargetAudience;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStatistics {
  totalSent: number;
  totalDelivered: number;
  deliveryRate: number;
  byType: Record<NotificationType, number>;
  byAudience: Record<TargetAudience, number>;
  recentNotifications: Notification[];
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    adminId: 'admin-1',
    adminName: 'أحمد محمد',
    title: 'عرض خاص!',
    message: 'احصل على خصم 20% على طلبك القادم',
    notificationType: 'promotion',
    priority: 'high',
    targetAudience: 'customers',
    sentAt: '2024-01-15T10:00:00Z',
    sentCount: 5000,
    deliveryStatus: {
      sent: 5000,
      delivered: 4800,
      failed: 200,
      pending: 0,
    },
    isDraft: false,
    status: 'sent',
    createdAt: '2024-01-15T09:55:00Z',
  },
  {
    id: 'notif-2',
    adminId: 'admin-1',
    adminName: 'أحمد محمد',
    title: 'تحديث النظام',
    message: 'سيتم إجراء صيانة للنظام يوم الجمعة القادم',
    notificationType: 'info',
    priority: 'medium',
    targetAudience: 'all',
    scheduledAt: '2024-01-20T08:00:00Z',
    sentCount: 0,
    deliveryStatus: {
      sent: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
    },
    isDraft: false,
    status: 'scheduled',
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 'notif-3',
    adminId: 'admin-1',
    adminName: 'أحمد محمد',
    title: 'ترحيب بالمستخدمين الجدد',
    message: 'مرحباً بك في Servy! استمتع بتجربة طلب ممتازة',
    notificationType: 'success',
    priority: 'low',
    targetAudience: 'customers',
    userIds: ['user-1', 'user-2', 'user-3'],
    sentAt: '2024-01-14T12:00:00Z',
    sentCount: 3,
    deliveryStatus: {
      sent: 3,
      delivered: 3,
      failed: 0,
      pending: 0,
    },
    isDraft: false,
    status: 'sent',
    createdAt: '2024-01-14T11:55:00Z',
  },
];

const mockTemplates: NotificationTemplate[] = [
  {
    id: 'template-1',
    adminId: 'admin-1',
    name: 'تحديث حالة الطلب',
    title: 'تحديث طلبك #{{orderId}}',
    message: 'تم تحديث حالة طلبك #{{orderId}} إلى {{status}}',
    notificationType: 'info',
    targetAudience: 'customers',
    variables: ['orderId', 'status'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'template-2',
    adminId: 'admin-1',
    name: 'عرض ترويجي',
    title: 'عرض خاص!',
    message: 'احصل على خصم {{discount}}% على طلبك القادم',
    notificationType: 'promotion',
    targetAudience: 'customers',
    variables: ['discount'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock API functions
export async function mockSendNotification(data: {
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  targetAudience: TargetAudience;
  userIds?: string[];
  scheduledAt?: string;
  sendNow: boolean;
}): Promise<Notification> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const notification: Notification = {
    id: `notif-${Date.now()}`,
    adminId: 'admin-1',
    adminName: 'أحمد محمد',
    title: data.title,
    message: data.message,
    notificationType: data.notificationType,
    priority: data.priority,
    targetAudience: data.targetAudience,
    userIds: data.userIds,
    scheduledAt: data.scheduledAt,
    sentAt: data.sendNow ? new Date().toISOString() : undefined,
    sentCount: data.sendNow ? (data.userIds?.length || 1000) : 0,
    deliveryStatus: {
      sent: data.sendNow ? (data.userIds?.length || 1000) : 0,
      delivered: data.sendNow ? Math.floor((data.userIds?.length || 1000) * 0.95) : 0,
      failed: data.sendNow ? Math.floor((data.userIds?.length || 1000) * 0.05) : 0,
      pending: 0,
    },
    isDraft: false,
    status: data.sendNow ? 'sent' : 'scheduled',
    createdAt: new Date().toISOString(),
  };

  mockNotifications.unshift(notification);
  return notification;
}

export async function mockGetNotifications(params?: {
  targetAudience?: TargetAudience | 'all';
  status?: NotificationStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<NotificationsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockNotifications];

  if (params?.targetAudience && params.targetAudience !== 'all') {
    filtered = filtered.filter((n) => n.targetAudience === params.targetAudience);
  }

  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((n) => n.status === params.status);
  }

  if (params?.dateFrom) {
    filtered = filtered.filter((n) => n.createdAt >= params.dateFrom!);
  }

  if (params?.dateTo) {
    filtered = filtered.filter((n) => n.createdAt <= params.dateTo!);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    notifications: filtered.slice(start, end),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function mockGetNotificationById(id: string): Promise<Notification> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const notification = mockNotifications.find((n) => n.id === id);
  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification;
}

export async function mockGetNotificationTemplates(): Promise<NotificationTemplate[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [...mockTemplates];
}

export async function mockCreateNotificationTemplate(
  data: Omit<NotificationTemplate, 'id' | 'adminId' | 'createdAt' | 'updatedAt'>
): Promise<NotificationTemplate> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const template: NotificationTemplate = {
    id: `template-${Date.now()}`,
    adminId: 'admin-1',
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockTemplates.push(template);
  return template;
}

export async function mockUpdateNotificationTemplate(
  id: string,
  data: Partial<NotificationTemplate>
): Promise<NotificationTemplate> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockTemplates.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error('Template not found');
  }

  mockTemplates[index] = {
    ...mockTemplates[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return mockTemplates[index];
}

export async function mockDeleteNotificationTemplate(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = mockTemplates.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error('Template not found');
  }

  mockTemplates.splice(index, 1);
}

export async function mockGetNotificationStatistics(params?: {
  period?: 'today' | 'week' | 'month' | 'year';
}): Promise<NotificationStatistics> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    totalSent: 10000,
    totalDelivered: 9500,
    deliveryRate: 95.0,
    byType: {
      info: 5000,
      promotion: 3000,
      warning: 1500,
      success: 400,
      error: 100,
    },
    byAudience: {
      all: 2000,
      customers: 6000,
      drivers: 1500,
      restaurants: 500,
      specific: 0,
    },
    recentNotifications: mockNotifications.slice(0, 5),
  };
}

export async function mockResendNotification(id: string): Promise<Notification> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const notification = mockNotifications.find((n) => n.id === id);
  if (!notification) {
    throw new Error('Notification not found');
  }

  // Create a new notification with same data
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
    sentAt: new Date().toISOString(),
    status: 'sent',
    createdAt: new Date().toISOString(),
  };

  mockNotifications.unshift(newNotification);
  return newNotification;
}

export async function mockDeleteNotification(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = mockNotifications.findIndex((n) => n.id === id);
  if (index === -1) {
    throw new Error('Notification not found');
  }

  mockNotifications.splice(index, 1);
}

// ——— Phase 3 real API ———

export interface FcmTokenStats {
  totalTokens: number;
  byPlatform: { platform: string; count: number }[];
}

export interface SendNotificationPayload {
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  targetAudience: TargetAudience;
  userIds?: string[];
  scheduledAt?: string;
  sendNow: boolean;
}

function audienceToTopic(audience: TargetAudience): string {
  switch (audience) {
    case 'customers':
      return 'customers';
    case 'drivers':
      return 'drivers';
    case 'restaurants':
      return 'all';
    default:
      return 'all';
  }
}

async function realSendToUser(userId: string, title: string, body: string): Promise<void> {
  await apiClient.post('/admin/notifications/send', {
    user_id: userId,
    title,
    body,
    data: { type: 'ADMIN' },
  });
}

async function realSendBulk(title: string, body: string, topic: string): Promise<void> {
  await apiClient.post('/admin/notifications/send-bulk', {
    title,
    body,
    topic,
    data: { type: 'ADMIN' },
  });
}

async function realSendNotification(data: SendNotificationPayload): Promise<void> {
  if (!data.sendNow) {
    throw new Error('جدولة الإشعارات غير مدعومة من الباك إند حالياً');
  }

  if (data.targetAudience === 'specific' && data.userIds?.length) {
    await Promise.all(
      data.userIds.map((userId) => realSendToUser(userId, data.title, data.message))
    );
    return;
  }

  await realSendBulk(data.title, data.message, audienceToTopic(data.targetAudience));
}

async function realGetFcmTokenStats(): Promise<FcmTokenStats> {
  const res = await apiClient.get('/admin/notifications/stats');
  const body = res.data as { data?: FcmTokenStats };
  const stats = body?.data ?? (res.data as FcmTokenStats);
  return {
    totalTokens: stats.totalTokens ?? 0,
    byPlatform: stats.byPlatform ?? [],
  };
}

export async function sendNotification(data: SendNotificationPayload): Promise<Notification> {
  try {
    if (shouldUseMock()) {
      return mockSendNotification(data);
    }
    await realSendNotification(data);
    return {
      id: `sent-${Date.now()}`,
      adminId: '',
      adminName: '',
      title: data.title,
      message: data.message,
      notificationType: data.notificationType,
      priority: data.priority,
      targetAudience: data.targetAudience,
      userIds: data.userIds,
      sentAt: new Date().toISOString(),
      sentCount: data.userIds?.length ?? 1,
      deliveryStatus: { sent: 1, delivered: 0, failed: 0, pending: 0 },
      isDraft: false,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getFcmTokenStats(): Promise<FcmTokenStats> {
  try {
    return shouldUseMock()
      ? {
          totalTokens: 1200,
          byPlatform: [
            { platform: 'android', count: 800 },
            { platform: 'ios', count: 350 },
            { platform: 'web', count: 50 },
          ],
        }
      : realGetFcmTokenStats();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function getNotificationStatistics(params?: {
  period?: 'today' | 'week' | 'month' | 'year';
}): Promise<NotificationStatistics> {
  try {
    return shouldUseMock() ? mockGetNotificationStatistics(params) : mockGetNotificationStatistics(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

// ——— P1: notification dispatch history ———

export interface NotificationHistoryItem {
  id: string;
  targetType: 'user' | 'topic';
  targetValue: string;
  title: string;
  body: string;
  data?: string;
  sentByAdmin: string;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface NotificationHistoryResponse {
  items: NotificationHistoryItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const mockHistoryItems: NotificationHistoryItem[] = [
  {
    id: 'nh-1',
    targetType: 'topic',
    targetValue: 'customers',
    title: 'عرض خاص!',
    body: 'احصل على خصم 20%',
    sentByAdmin: 'admin-1',
    success: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'nh-2',
    targetType: 'user',
    targetValue: 'user-uuid-1',
    title: 'تحديث الطلب',
    body: 'تم شحن طلبك',
    sentByAdmin: 'api_key',
    success: false,
    errorMessage: 'FCM token invalid',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function mapHistoryItem(raw: Record<string, unknown>): NotificationHistoryItem {
  return {
    id: String(raw.id ?? ''),
    targetType: (raw.target_type ?? raw.targetType ?? 'user') as 'user' | 'topic',
    targetValue: String(raw.target_value ?? raw.targetValue ?? ''),
    title: String(raw.title ?? ''),
    body: String(raw.body ?? ''),
    data: raw.data != null ? String(raw.data) : undefined,
    sentByAdmin: String(raw.sent_by_admin ?? raw.sentByAdmin ?? ''),
    success: Boolean(raw.success ?? true),
    errorMessage:
      raw.error_message != null
        ? String(raw.error_message)
        : raw.errorMessage != null
          ? String(raw.errorMessage)
          : undefined,
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
  };
}

async function realGetNotificationHistory(params?: {
  targetType?: 'user' | 'topic';
  page?: number;
  limit?: number;
}): Promise<NotificationHistoryResponse> {
  const res = await apiClient.get('/admin/notifications/history', {
    params: {
      targetType: params?.targetType,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    },
  });
  const body = (res.data as { data?: { items?: unknown[]; pagination?: NotificationHistoryResponse['pagination'] } })
    .data ?? res.data;
  const rawItems = (body as { items?: unknown[] }).items ?? [];
  return {
    items: (rawItems as Record<string, unknown>[]).map(mapHistoryItem),
    pagination: (body as NotificationHistoryResponse).pagination ?? {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      total: rawItems.length,
      totalPages: 1,
    },
  };
}

async function mockGetNotificationHistory(params?: {
  targetType?: 'user' | 'topic';
  page?: number;
  limit?: number;
}): Promise<NotificationHistoryResponse> {
  await new Promise((r) => setTimeout(r, 300));
  let items = [...mockHistoryItems];
  if (params?.targetType) {
    items = items.filter((i) => i.targetType === params.targetType);
  }
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit) || 1,
    },
  };
}

export async function getNotificationHistory(params?: {
  targetType?: 'user' | 'topic';
  page?: number;
  limit?: number;
}): Promise<NotificationHistoryResponse> {
  try {
    return shouldUseMock()
      ? mockGetNotificationHistory(params)
      : realGetNotificationHistory(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

