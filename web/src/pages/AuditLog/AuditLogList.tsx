import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { getAuditLogs, AuditLogEntry } from '../../services/api/auditLog';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const defaultDateTo = () => new Date().toISOString().split('T')[0];
const defaultDateFrom = () =>
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const AuditLogListPage: React.FC = () => {
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [entityIdSearch, setEntityIdSearch] = useState('');
  const [adminIdFilter, setAdminIdFilter] = useState('');
  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [
      'audit-logs',
      actionFilter,
      entityFilter,
      entityIdSearch,
      adminIdFilter,
      dateFrom,
      dateTo,
      page,
    ],
    queryFn: () =>
      getAuditLogs({
        actionType: actionFilter === 'all' ? undefined : actionFilter,
        entityType: entityFilter === 'all' ? undefined : entityFilter,
        entityId: entityIdSearch.trim() || undefined,
        adminId: adminIdFilter.trim() || undefined,
        dateFrom,
        dateTo,
        page,
        limit: 20,
      }),
  });

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        accessorKey: 'adminId',
        header: 'الأدمن',
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontSize: 13 }}>
            {row.original.adminName || row.original.adminId || '—'}
          </Typography>
        ),
      },
      { accessorKey: 'actionType', header: 'الإجراء' },
      { accessorKey: 'entityType', header: 'الكيان' },
      { accessorKey: 'entityId', header: 'معرّف الكيان' },
      { accessorKey: 'description', header: 'الوصف' },
      {
        id: 'http',
        header: 'HTTP',
        cell: ({ row }) => (
          <Typography variant="caption" sx={{ color: '#5A6A5A' }}>
            {row.original.method
              ? `${row.original.method} ${row.original.statusCode ?? ''}`
              : '—'}
          </Typography>
        ),
      },
      { accessorKey: 'ipAddress', header: 'IP' },
      {
        accessorKey: 'createdAt',
        header: 'التاريخ',
        cell: (info) =>
          format(new Date(String(info.getValue())), 'dd MMM yyyy HH:mm', { locale: ar }),
      },
    ],
    []
  );

  return (
    <Box sx={{ color: '#1A2E1A' }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        سجل التدقيق
      </Typography>
      <Typography variant="body2" sx={{ color: '#5A6A5A', mb: 3 }}>
        سجل تلقائي لكل تعديل إداري (آخر 7 أيام افتراضياً)
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>نوع الإجراء</InputLabel>
          <Select
            value={actionFilter}
            label="نوع الإجراء"
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="create">إنشاء</MenuItem>
            <MenuItem value="update">تحديث</MenuItem>
            <MenuItem value="delete">حذف</MenuItem>
            <MenuItem value="approve">موافقة</MenuItem>
            <MenuItem value="other">أخرى</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>نوع الكيان</InputLabel>
          <Select
            value={entityFilter}
            label="نوع الكيان"
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="order">طلب</MenuItem>
            <MenuItem value="restaurant">متجر</MenuItem>
            <MenuItem value="user">مستخدم</MenuItem>
            <MenuItem value="rider">سائق</MenuItem>
            <MenuItem value="coupon">كوبون</MenuItem>
            <MenuItem value="review">تقييم</MenuItem>
            <MenuItem value="menu_item">صنف منيو</MenuItem>
            <MenuItem value="notification">إشعار</MenuItem>
            <MenuItem value="settings">إعدادات</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="معرّف الكيان"
          value={entityIdSearch}
          onChange={(e) => {
            setEntityIdSearch(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          size="small"
          label="معرّف الأدمن"
          value={adminIdFilter}
          onChange={(e) => {
            setAdminIdFilter(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          size="small"
          type="date"
          label="من"
          InputLabelProps={{ shrink: true }}
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
        />
        <TextField
          size="small"
          type="date"
          label="إلى"
          InputLabelProps={{ shrink: true }}
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
        />
      </Box>

      {isLoading ? (
        <SkeletonLoader variant="table" />
      ) : (
        <DataTable data={data?.logs ?? []} columns={columns} searchable={false} />
      )}
    </Box>
  );
};

export default AuditLogListPage;
