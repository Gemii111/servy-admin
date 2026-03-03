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
import { useQuery } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import {
  mockGetRiderById,
  mockGetRiderEarnings,
  mockGetRiderReviews,
  mockUpdateRiderStatus,
  getRiderStatusLabel,
} from '../../services/api/riders';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '../../hooks/useSnackbar';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const RiderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { data: rider, isLoading } = useQuery({
    queryKey: ['rider', id],
    queryFn: () => mockGetRiderById(id!),
    enabled: !!id,
  });

  const { data: earnings } = useQuery({
    queryKey: ['rider', id, 'earnings'],
    queryFn: () => mockGetRiderEarnings(id!),
    enabled: !!id && !!rider,
  });

  const { data: reviews } = useQuery({
    queryKey: ['rider', id, 'reviews'],
    queryFn: () => mockGetRiderReviews(id!),
    enabled: !!id && !!rider,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: 'active' | 'inactive' }) =>
      mockUpdateRiderStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider', id] });
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      showSnackbar('تم تحديث حالة السائق', 'success');
    },
    onError: () => showSnackbar('فشل تحديث الحالة', 'error'),
  });

  if (isLoading) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  if (!rider) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" sx={{ color: '#1A2E1A', mb: 2 }}>
          السائق غير موجود
        </Typography>
        <Button variant="contained" onClick={() => navigate('/riders')}>
          العودة للقائمة
        </Button>
      </Box>
    );
  }

  const statusColors: Record<string, string> = {
    active: '#22C55E',
    inactive: '#5A6A5A',
    pending: '#F59E0B',
  };

  return (
    <Box sx={{ color: '#1A2E1A' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/riders')} sx={{ color: '#5A6A5A' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {rider.first_name} {rider.last_name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
              تفاصيل السائق والأرباح والتقييمات
            </Typography>
          </Box>
        </Box>
        {rider.status !== 'pending' && (
          <Button
            variant="outlined"
            onClick={() =>
              updateStatusMutation.mutate({
                status: rider.status === 'active' ? 'inactive' : 'active',
              })
            }
            disabled={updateStatusMutation.isPending}
            sx={{
              borderColor: rider.status === 'active' ? '#EF4444' : '#86B573',
              color: rider.status === 'active' ? '#EF4444' : '#86B573',
            }}
          >
            {rider.status === 'active' ? 'تعطيل' : 'تفعيل'}
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
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
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            المعلومات الأساسية
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="body2">
              <strong>البريد:</strong> {rider.email}
            </Typography>
            <Typography variant="body2">
              <strong>الهاتف:</strong> {rider.phone}
            </Typography>
            <Typography variant="body2">
              <strong>الحالة:</strong>{' '}
              <Chip
                label={getRiderStatusLabel(rider.status)}
                size="small"
                sx={{
                  bgcolor: `${statusColors[rider.status] || '#5A6A5A'}20`,
                  color: statusColors[rider.status] || '#5A6A5A',
                }}
              />
            </Typography>
            <Typography variant="body2">
              <strong>موافق عليه:</strong> {rider.is_approved ? 'نعم' : 'لا'}
            </Typography>
            <Typography variant="body2">
              <strong>التقييم:</strong> {rider.rating?.toFixed(1) || '-'} ⭐
            </Typography>
            <Typography variant="body2">
              <strong>تاريخ الانضمام:</strong>{' '}
              {format(new Date(rider.created_at), 'dd MMM yyyy', { locale: ar })}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid #B1C0B1',
              bgcolor: '#FFFFFF',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon /> الأرباح
            </Typography>
            {earnings ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(134,181,115,0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: '#5A6A5A' }}>اليوم</Typography>
                  <Typography variant="h6" sx={{ color: '#86B573', fontWeight: 700 }}>
                    {earnings.today_earnings} ج.م
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5A6A5A' }}>
                    {earnings.today_deliveries} طلب
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(134,181,115,0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: '#5A6A5A' }}>الأسبوع</Typography>
                  <Typography variant="h6" sx={{ color: '#86B573', fontWeight: 700 }}>
                    {earnings.week_earnings} ج.م
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5A6A5A' }}>
                    {earnings.week_deliveries} طلب
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(134,181,115,0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: '#5A6A5A' }}>الشهر</Typography>
                  <Typography variant="h6" sx={{ color: '#86B573', fontWeight: 700 }}>
                    {earnings.month_earnings} ج.م
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5A6A5A' }}>
                    {earnings.month_deliveries} طلب
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(134,181,115,0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: '#5A6A5A' }}>الإجمالي</Typography>
                  <Typography variant="h6" sx={{ color: '#86B573', fontWeight: 700 }}>
                    {earnings.total_earnings} ج.م
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5A6A5A' }}>
                    {earnings.total_deliveries} طلب • معدل {earnings.average_earning_per_delivery.toFixed(0)} ج.م/طلب
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
                لا توجد بيانات أرباح
              </Typography>
            )}
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
              <StarIcon /> التقييمات والمراجعات
            </Typography>
            {reviews && reviews.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reviews.map((r) => (
                  <Box
                    key={r.id}
                    sx={{
                      p: 2,
                      border: '1px solid #B1C0B1',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {r.user_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                        <Typography variant="body2">{r.rating}</Typography>
                      </Box>
                    </Box>
                    {r.comment && (
                      <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
                        {r.comment}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: '#5A6A5A' }}>
                      {format(new Date(r.created_at), 'dd MMM yyyy', { locale: ar })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
                لا توجد تقييمات بعد
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default RiderDetailsPage;
