import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import {
  getDeliveryRequestById,
  cancelDeliveryRequest,
  getDeliveryRequestStatusLabel,
} from '../../services/api/deliveryRequests';
import { useSnackbar } from '../../hooks/useSnackbar';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const DeliveryRequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { data: request, isLoading } = useQuery({
    queryKey: ['delivery-request', id],
    queryFn: () => getDeliveryRequestById(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelDeliveryRequest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-request', id] });
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
      showSnackbar('تم إلغاء طلب التوصيل', 'success');
    },
    onError: () => showSnackbar('فشل إلغاء الطلب', 'error'),
  });

  if (isLoading) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  if (!request) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" sx={{ color: '#1A2E1A', mb: 2 }}>
          طلب التوصيل غير موجود
        </Typography>
        <Button variant="contained" onClick={() => navigate('/delivery-requests')}>
          العودة للقائمة
        </Button>
      </Box>
    );
  }

  const statusColors: Record<string, string> = {
    pending: '#F59E0B',
    accepted: '#38BDF8',
    picked_up: '#8B5CF6',
    delivering: '#86B573',
    delivered: '#22C55E',
    cancelled: '#EF4444',
  };

  const canCancel = ['pending', 'accepted'].includes(request.status);

  return (
    <Box sx={{ color: '#1A2E1A' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/delivery-requests')} sx={{ color: '#5A6A5A' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              طلب توصيل #{request.id.slice(-6)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
              تفاصيل طلب التوصيل من نقطة إلى نقطة (P2P)
            </Typography>
          </Box>
        </Box>
        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            إلغاء الطلب
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid #B1C0B1',
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon /> نقطة الاستلام
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {request.pickup_address.address_line}
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
            {request.pickup_address.city} • {request.pickup_address.label}
          </Typography>
          <Typography variant="caption" sx={{ color: '#5A6A5A' }}>
            إحداثيات: {request.pickup_address.latitude.toFixed(4)}، {request.pickup_address.longitude.toFixed(4)}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid #B1C0B1',
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon /> نقطة التسليم
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {request.delivery_address.address_line}
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
            {request.delivery_address.city} • {request.delivery_address.label}
          </Typography>
          <Typography variant="caption" sx={{ color: '#5A6A5A' }}>
            إحداثيات: {request.delivery_address.latitude.toFixed(4)}، {request.delivery_address.longitude.toFixed(4)}
          </Typography>
        </Paper>
      </Box>

      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid #B1C0B1',
          bgcolor: '#FFFFFF',
          mt: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600 }}>
          تفاصيل إضافية
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>المستلم</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.receiver_name}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>هاتف المستلم</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.receiver_phone}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>وصف المحتوى</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.item_description || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>طريقة الدفع</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {request.payment_method === 'cash' ? 'كاش' : request.payment_method === 'card' ? 'بطاقة' : 'محفظة'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>الحالة</Typography>
            <Chip
              label={getDeliveryRequestStatusLabel(request.status)}
              size="small"
              sx={{
                bgcolor: `${statusColors[request.status] || '#5A6A5A'}20`,
                color: statusColors[request.status] || '#5A6A5A',
              }}
            />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>الرسوم</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, color: '#86B573' }}>
              {request.fee ? `${request.fee} ج.م` : '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>التاريخ</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {format(new Date(request.created_at), 'dd MMM yyyy HH:mm', { locale: ar })}
            </Typography>
          </Box>
          {request.notes && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="body2" sx={{ color: '#5A6A5A' }}>ملاحظات</Typography>
              <Typography variant="body1">{request.notes}</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default DeliveryRequestDetailsPage;
