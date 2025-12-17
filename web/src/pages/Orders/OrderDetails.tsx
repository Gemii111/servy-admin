import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import { mockGetOrderById, mockUpdateOrderStatus, Order } from '../../services/api/orders';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [status, setStatus] = useState<Order['status'] | ''>('');

  const {
    data: order,
    isLoading,
  } = useQuery<Order, Error>({
    queryKey: ['order', id],
    queryFn: () => mockGetOrderById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: Order['status']) => mockUpdateOrderStatus(id!, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showSnackbar('تم تحديث حالة الطلب بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء تحديث حالة الطلب', 'error');
    },
  });

  const handleStatusChange = (newStatus: Order['status']) => {
    setStatus(newStatus);
    updateStatusMutation.mutate(newStatus);
  };

  if (isLoading) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  if (!order) {
    return (
      <EmptyState
        title="الطلب غير موجود"
        description="لم يتم العثور على الطلب المطلوب."
      />
    );
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'قيد الانتظار', color: '#F59E0B' },
    confirmed: { label: 'مؤكد', color: '#38BDF8' },
    preparing: { label: 'قيد التحضير', color: '#2563EB' },
    ready: { label: 'جاهز', color: '#22C55E' },
    picked_up: { label: 'تم الاستلام', color: '#8B5CF6' },
    delivered: { label: 'تم التسليم', color: '#22C55E' },
    cancelled: { label: 'ملغي', color: '#EF4444' },
  };

  const paymentStatusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'قيد الانتظار', color: '#F59E0B' },
    paid: { label: 'مدفوع', color: '#22C55E' },
    failed: { label: 'فشل', color: '#EF4444' },
    refunded: { label: 'مسترد', color: '#9CA3AF' },
  };

  const paymentMethodLabels: Record<string, string> = {
    cash: 'نقدي',
    card: 'بطاقة',
    online: 'أونلاين',
  };

  return (
    <Box sx={{ color: '#E5E7EB' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/orders')}
            sx={{
              color: '#9CA3AF',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700} mb={0.5}>
              {order.orderNumber}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              تفاصيل الطلب
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/orders/${id}/edit`)}
          >
            تعديل
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف الطلب "${order.orderNumber}"؟`)) {
                navigate('/orders');
              }
            }}
          >
            حذف
          </Button>
        </Box>
      </Box>

      {/* Status Update */}
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
          تحديث حالة الطلب
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>حالة الطلب</InputLabel>
          <Select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
            label="حالة الطلب"
            disabled={updateStatusMutation.isPending}
            sx={{
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
              '& .MuiSvgIcon-root': { color: '#9CA3AF' },
            }}
          >
            <MenuItem value="pending">قيد الانتظار</MenuItem>
            <MenuItem value="confirmed">مؤكد</MenuItem>
            <MenuItem value="preparing">قيد التحضير</MenuItem>
            <MenuItem value="ready">جاهز</MenuItem>
            <MenuItem value="picked_up">تم الاستلام</MenuItem>
            <MenuItem value="delivered">تم التسليم</MenuItem>
            <MenuItem value="cancelled">ملغي</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Order Info */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            md: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Customer & Restaurant Info */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
            معلومات الطلب
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
              gap: 2.5,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                العميل
              </Typography>
              <Typography variant="body1" sx={{ color: '#E5E7EB', fontWeight: 500 }}>
                {order.customerName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                {order.customerPhone}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#1F2937' }} />

            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                المطعم
              </Typography>
              <Typography variant="body1" sx={{ color: '#E5E7EB', fontWeight: 500 }}>
                {order.restaurantName}
              </Typography>
            </Box>

            {order.driverName && (
              <>
                <Divider sx={{ borderColor: '#1F2937' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                    السائق
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E5E7EB', fontWeight: 500 }}>
                    {order.driverName}
                  </Typography>
                </Box>
              </>
            )}

            <Divider sx={{ borderColor: '#1F2937' }} />

            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                حالة الطلب
              </Typography>
              <Chip
                label={statusConfig[order.status].label}
                size="small"
                sx={{
                  bgcolor: `${statusConfig[order.status].color}20`,
                  color: statusConfig[order.status].color,
                  fontWeight: 500,
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                حالة الدفع
              </Typography>
              <Chip
                label={paymentStatusConfig[order.paymentStatus].label}
                size="small"
                sx={{
                  bgcolor: `${paymentStatusConfig[order.paymentStatus].color}20`,
                  color: paymentStatusConfig[order.paymentStatus].color,
                  fontWeight: 500,
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                طريقة الدفع
              </Typography>
              <Typography variant="body1" sx={{ color: '#E5E7EB' }}>
                {paymentMethodLabels[order.paymentMethod]}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                تاريخ الطلب
              </Typography>
              <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
                {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: ar })}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Delivery & Payment Info */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
            معلومات التسليم والدفع
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
              gap: 2.5,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                عنوان التسليم
              </Typography>
              <Typography variant="body1" sx={{ color: '#E5E7EB' }}>
                {order.deliveryAddress}
              </Typography>
            </Box>

            {order.estimatedDeliveryTime && (
              <>
                <Divider sx={{ borderColor: '#1F2937' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                    الوقت المتوقع للتسليم
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E5E7EB', fontWeight: 500 }}>
                    {order.estimatedDeliveryTime}
                  </Typography>
                </Box>
              </>
            )}

            {order.notes && (
              <>
                <Divider sx={{ borderColor: '#1F2937' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                    ملاحظات
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
                    {order.notes}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Order Items */}
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
          أصناف الطلب
        </Typography>

        <Box sx={{ mb: 3 }}>
          {order.items.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
                borderBottom: index < order.items.length - 1 ? '1px solid #1F2937' : 'none',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ color: '#E5E7EB', fontWeight: 500, mb: 0.5 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  الكمية: {item.quantity} × {item.price} ر.س
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#E5E7EB', fontWeight: 600 }}>
                {item.total} ر.س
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: '#1F2937', mb: 2 }} />

        {/* Order Summary */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              المجموع الفرعي
            </Typography>
            <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
              {order.subtotal} ر.س
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              رسوم التوصيل
            </Typography>
            <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
              {order.deliveryFee} ر.س
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              الضريبة
            </Typography>
            <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
              {order.tax} ر.س
            </Typography>
          </Box>
          <Divider sx={{ borderColor: '#1F2937', my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
              الإجمالي
            </Typography>
            <Typography variant="h6" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
              {order.total} ر.س
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderDetailsPage;

