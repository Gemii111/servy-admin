/**
 * Admin audit log API — P1 handoff §7
 */

import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  actionType: string;
  entityType: string;
  entityId?: string;
  description: string;
  method?: string;
  path?: string;
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function mapAuditLog(raw: Record<string, unknown>): AuditLogEntry {
  return {
    id: String(raw.id ?? ''),
    adminId: String(raw.adminId ?? raw.admin_id ?? ''),
    adminName: String(raw.adminName ?? raw.admin_name ?? raw.adminId ?? raw.admin_id ?? ''),
    actionType: String(raw.actionType ?? raw.action_type ?? ''),
    entityType: String(raw.entityType ?? raw.entity_type ?? ''),
    entityId:
      raw.entityId != null
        ? String(raw.entityId)
        : raw.entity_id != null
          ? String(raw.entity_id)
          : undefined,
    description: String(raw.description ?? ''),
    method: raw.method != null ? String(raw.method) : undefined,
    path: raw.path != null ? String(raw.path) : undefined,
    statusCode:
      raw.statusCode != null
        ? Number(raw.statusCode)
        : raw.status_code != null
          ? Number(raw.status_code)
          : undefined,
    ipAddress:
      raw.ipAddress != null
        ? String(raw.ipAddress)
        : raw.ip_address != null
          ? String(raw.ip_address)
          : undefined,
    userAgent:
      raw.userAgent != null
        ? String(raw.userAgent)
        : raw.user_agent != null
          ? String(raw.user_agent)
          : undefined,
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
  };
}

const mockLogs: AuditLogEntry[] = Array.from({ length: 15 }, (_, i) => ({
  id: `log-${i + 1}`,
  adminId: 'admin-1',
  adminName: 'admin-1',
  actionType: ['create', 'update', 'delete', 'approve'][i % 4],
  entityType: ['order', 'restaurant', 'user', 'coupon'][i % 4],
  entityId: `ent-${i}`,
  description: `POST /admin/orders/ent-${i}/cancel (ent-${i})`,
  method: 'POST',
  path: `/admin/orders/ent-${i}/cancel`,
  statusCode: 200,
  ipAddress: '196.0.0.1',
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

async function realGetAuditLogs(params?: {
  actionType?: string;
  entityType?: string;
  entityId?: string;
  adminId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<AuditLogsResponse> {
  const { data } = await apiClient.get('/admin/audit-logs', { params });
  const body = (data as { data?: AuditLogsResponse }).data ?? (data as AuditLogsResponse);
  const logs = (body.logs ?? []).map((l) =>
    mapAuditLog(l as unknown as Record<string, unknown>)
  );
  return {
    logs,
    pagination: body.pagination ?? {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      total: logs.length,
      totalPages: 1,
    },
  };
}

async function mockGetAuditLogs(params?: {
  actionType?: string;
  entityType?: string;
  entityId?: string;
  adminId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<AuditLogsResponse> {
  await new Promise((r) => setTimeout(r, 300));
  let logs = [...mockLogs];
  if (params?.actionType && params.actionType !== 'all') {
    logs = logs.filter((l) => l.actionType === params.actionType);
  }
  if (params?.entityType && params.entityType !== 'all') {
    logs = logs.filter((l) => l.entityType === params.entityType);
  }
  if (params?.entityId) {
    logs = logs.filter((l) => l.entityId?.includes(params.entityId!));
  }
  if (params?.adminId) {
    logs = logs.filter((l) => l.adminId.includes(params.adminId!));
  }
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const start = (page - 1) * limit;
  return {
    logs: logs.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: logs.length,
      totalPages: Math.ceil(logs.length / limit) || 1,
    },
  };
}

export async function getAuditLogs(
  params?: Parameters<typeof realGetAuditLogs>[0]
): Promise<AuditLogsResponse> {
  try {
    return shouldUseMock() ? mockGetAuditLogs(params) : realGetAuditLogs(params);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
