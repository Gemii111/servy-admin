import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import { mockGetOrders, Order } from '../../services/api/orders';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', statusFilter, paymentStatusFilter, searchQuery, page, limit],
    queryFn: () =>
      mockGetOrders({
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        search: searchQuery,
        page,
        limit,
      }),
  });

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'رقم الطلب',
        cell: (info) => (
          <Typography sx={{ color: '#2563EB', fontWeight: 600, fontSize: 13 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'العميل',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'restaurantName',
        header: 'المطعم',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'حالة الطلب',
        cell: (info) => {
          const status = String(info.getValue());
          const labels: Record<string, { label: string; color: string }> = {
            pending: { label: 'قيد الانتظار', color: '#F59E0B' },
            confirmed: { label: 'مؤكد', color: '#38BDF8' },
            preparing: { label: 'قيد التحضير', color: '#2563EB' },
            ready: { label: 'جاهز', color: '#22C55E' },
            picked_up: { label: 'تم الاستلام', color: '#8B5CF6' },
            delivered: { label: 'تم التسليم', color: '#22C55E' },
            cancelled: { label: 'ملغي', color: '#EF4444' },
          };
          const config = labels[status] || { label: status, color: '#9CA3AF' };
          return (
            <Chip
              label={config.label}
              size="small"
              sx={{
                bgcolor: `${config.color}20`,
                color: config.color,
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'paymentStatus',
        header: 'حالة الدفع',
        cell: (info) => {
          const status = String(info.getValue());
          const labels: Record<string, { label: string; color: string }> = {
            pending: { label: 'قيد الانتظار', color: '#F59E0B' },
            paid: { label: 'مدفوع', color: '#22C55E' },
            failed: { label: 'فشل', color: '#EF4444' },
            refunded: { label: 'مسترد', color: '#9CA3AF' },
          };
          const config = labels[status] || { label: status, color: '#9CA3AF' };
          return (
            <Chip
              label={config.label}
              size="small"
              sx={{
                bgcolor: `${config.color}20`,
                color: config.color,
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'total',
        header: 'المبلغ الإجمالي',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14, fontWeight: 500 }}>
            {String(info.getValue())} ر.س
          </Typography>
        ),
      },
      {
        accessorKey: 'driverName',
        header: 'السائق',
        cell: (info) => {
          const driver = info.getValue();
          return (
            <Typography sx={{ color: driver ? '#E5E7EB' : '#9CA3AF', fontSize: 14 }}>
              {driver ? String(driver) : 'غير محدد'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'تاريخ الطلب',
        cell: (info) => (
          <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
            {format(new Date(String(info.getValue())), 'dd MMM yyyy, HH:mm', { locale: ar })}
          </Typography>
        ),
      },
    ],
    []
  );

  const handleView = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleEdit = (order: Order) => {
    navigate(`/orders/${order.id}/edit`);
  };

  const handleDelete = (order: Order) => {
    if (window.confirm(`هل أنت متأكد من حذف الطلب "${order.orderNumber}"؟`)) {
      // Handle delete
      showSnackbar('تم حذف الطلب', 'success');
    }
  };

  return (
    <Box sx={{ color: '#E5E7EB' }}>
      {/* Header */}
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
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            إدارة الطلبات
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            عرض وإدارة جميع الطلبات في النظام
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>حالة الطلب</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            label="حالة الطلب"
            sx={{
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
              '& .MuiSvgIcon-root': { color: '#9CA3AF' },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="pending">قيد الانتظار</MenuItem>
            <MenuItem value="confirmed">مؤكد</MenuItem>
            <MenuItem value="preparing">قيد التحضير</MenuItem>
            <MenuItem value="ready">جاهز</MenuItem>
            <MenuItem value="picked_up">تم الاستلام</MenuItem>
            <MenuItem value="delivered">تم التسليم</MenuItem>
            <MenuItem value="cancelled">ملغي</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>حالة الدفع</InputLabel>
          <Select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPage(1);
            }}
            label="حالة الدفع"
            sx={{
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
              '& .MuiSvgIcon-root': { color: '#9CA3AF' },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="pending">قيد الانتظار</MenuItem>
            <MenuItem value="paid">مدفوع</MenuItem>
            <MenuItem value="failed">فشل</MenuItem>
            <MenuItem value="refunded">مسترد</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="ابحث عن طلب..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6B7280', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#020617',
              '& fieldset': { borderColor: '#1F2937' },
              '&:hover fieldset': { borderColor: '#374151' },
            },
            input: { color: '#E5E7EB' },
          }}
        />
      </Box>

      {/* Table */}
      {isLoading ? (
        <SkeletonLoader variant="table" count={5} />
      ) : !data || data.orders.length === 0 ? (
        <EmptyState
          title="لا يوجد طلبات"
          description="لم يتم العثور على أي طلبات لعرضها."
        />
      ) : (
        <>
          <DataTable
            data={data.orders}
            columns={columns}
            searchable={false}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {/* Custom Pagination */}
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              إجمالي النتائج: {data.pagination.total} | الصفحة {data.pagination.page} من{' '}
              {data.pagination.totalPages}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                السابق
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                التالي
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default OrdersListPage;

