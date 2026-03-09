import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  getDeliveryRequests,
  cancelDeliveryRequest,
  DeliveryRequest,
  getDeliveryRequestStatusLabel,
} from '../../services/api/deliveryRequests';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import CancelIcon from '@mui/icons-material/Cancel';

const DeliveryRequestsListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['delivery-requests', statusFilter],
    queryFn: () =>
      getDeliveryRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelDeliveryRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
      showSnackbar('تم إلغاء طلب التوصيل', 'success');
    },
    onError: () => showSnackbar('فشل إلغاء الطلب', 'error'),
  });

  const columns = useMemo<ColumnDef<DeliveryRequest>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'رقم الطلب',
        cell: (info) => (
          <Typography sx={{ color: '#86B573', fontWeight: 600, fontSize: 13 }}>
            #{String(info.getValue()).slice(-6)}
          </Typography>
        ),
      },
      {
        id: 'pickup',
        header: 'نقطة الاستلام',
        cell: ({ row }) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }} noWrap>
            {row.original.pickup_address.address_line}، {row.original.pickup_address.city}
          </Typography>
        ),
      },
      {
        id: 'delivery',
        header: 'نقطة التسليم',
        cell: ({ row }) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }} noWrap>
            {row.original.delivery_address.address_line}، {row.original.delivery_address.city}
          </Typography>
        ),
      },
      {
        accessorKey: 'receiver_name',
        header: 'المستلم',
        cell: (info) => (
          <Typography sx={{ color: '#1A2E1A', fontSize: 14 }}>{String(info.getValue())}</Typography>
        ),
      },
      {
        accessorKey: 'item_description',
        header: 'الوصف',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }} noWrap>
            {String(info.getValue() || '-')}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: (info) => {
          const status = String(info.getValue());
          const colors: Record<string, string> = {
            pending: '#F59E0B',
            accepted: '#38BDF8',
            picked_up: '#8B5CF6',
            delivering: '#86B573',
            delivered: '#22C55E',
            cancelled: '#EF4444',
          };
          return (
            <Chip
              label={getDeliveryRequestStatusLabel(status)}
              size="small"
              sx={{
                bgcolor: `${colors[status] || '#5A6A5A'}20`,
                color: colors[status] || '#5A6A5A',
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'fee',
        header: 'الرسوم',
        cell: (info) => (
          <Typography sx={{ color: '#86B573', fontSize: 14, fontWeight: 500 }}>
            {info.getValue() ? `${info.getValue()} ج.م` : '-'}
          </Typography>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'التاريخ',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {format(new Date(String(info.getValue())), 'dd MMM yyyy HH:mm', { locale: ar })}
          </Typography>
        ),
      },
      {
        id: 'cancel_action',
        header: 'إجراء',
        cell: ({ row }) => {
          const req = row.original;
          const canCancel = ['pending', 'accepted'].includes(req.status);
          return (
            canCancel ? (
              <Box onClick={(e) => e.stopPropagation()}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => cancelMutation.mutate(req.id)}
                disabled={cancelMutation.isPending}
                sx={{
                  borderColor: '#EF4444',
                  color: '#EF4444',
                  '&:hover': { borderColor: '#DC2626', bgcolor: 'rgba(239, 68, 68, 0.08)' },
                }}
              >
                إلغاء
              </Button>
              </Box>
            ) : null
          );
        },
      },
    ],
    [cancelMutation]
  );

  if (isLoading) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  const requests = data || [];

  return (
    <Box sx={{ color: '#1A2E1A' }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5} sx={{ fontSize: { xs: 20, sm: 24 } }}>
            طلبات التوصيل P2P
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A', fontSize: { xs: 12, sm: 14 } }}>
            إدارة طلبات التوصيل المباشر من نقطة إلى نقطة
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>الحالة</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="الحالة"
            sx={{
              bgcolor: '#FFFFFF',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B1C0B1' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#86B573' },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="pending">معلق</MenuItem>
            <MenuItem value="accepted">مقبول</MenuItem>
            <MenuItem value="picked_up">تم الاستلام</MenuItem>
            <MenuItem value="delivering">قيد التوصيل</MenuItem>
            <MenuItem value="delivered">تم التسليم</MenuItem>
            <MenuItem value="cancelled">ملغي</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {requests.length === 0 ? (
        <EmptyState
          title="لا توجد طلبات توصيل"
          description="لم يتم العثور على طلبات توصيل P2P تطابق الفلاتر."
        />
      ) : (
        <DataTable
          data={requests}
          columns={columns}
          searchable={false}
          isLoading={isLoading}
          onRowClick={(r) => navigate(`/delivery-requests/${r.id}`)}
        />
      )}
    </Box>
  );
};

export default DeliveryRequestsListPage;
