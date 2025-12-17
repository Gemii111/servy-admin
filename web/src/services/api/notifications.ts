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

