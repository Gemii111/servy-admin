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
import SkeletonLoader from '../../components/common/SkeletonLoader';
import {
  getRiderById,
  updateRiderStatus,
  approveRider,
  riderNeedsApproval,
  getRiderStatusLabel,
  getVehicleLabel,
} from '../../services/api/riders';
import { getRiderReviewsList } from '../../services/api/reviews';
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
    queryFn: () => getRiderById(id!),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['rider-reviews', id],
    queryFn: () => getRiderReviewsList(id!, { page: 1, page_size: 50 }),
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const allRiderReviews = reviewsData?.reviews ?? [];
  const reviews = allRiderReviews.filter(
    (r) =>
      !id ||
      r.targetId === id ||
      r.targetId === rider?.user_id ||
      r.targetId === rider?.id
  );
  const displayReviews =
    reviews.length > 0 ? reviews : allRiderReviews;

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { isActive?: boolean; status?: string }) =>
      updateRiderStatus(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider', id] });
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      showSnackbar('تم تحديث حالة السائق', 'success');
    },
    onError: () => showSnackbar('فشل تحديث الحالة', 'error'),
  });

  const approveMutation = useMutation({
    mutationFn: () => approveRider(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider', id] });
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      showSnackbar('تمت الموافقة على السائق', 'success');
    },
    onError: (e: Error) => showSnackbar(e.message, 'error'),
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

  const pendingApproval = riderNeedsApproval(rider);

  const statusColors: Record<string, string> = {
    available: '#22C55E',
    heading_to_restaurant: '#3B82F6',
    at_restaurant: '#8B5CF6',
    delivering: '#F59E0B',
    offline: '#5A6A5A',
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
              {rider.rider_name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
              تفاصيل السائق والتقييمات
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {pendingApproval && (
            <Button
              variant="contained"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              sx={{ bgcolor: '#86B573', '&:hover': { bgcolor: '#6B9B5E' } }}
            >
              موافقة على السائق
            </Button>
          )}
          {!pendingApproval && (
            <Button
              variant="outlined"
              onClick={() =>
                updateStatusMutation.mutate({
                  isActive: !rider.is_active,
                })
              }
              disabled={updateStatusMutation.isPending}
              sx={{
                borderColor: rider.is_active ? '#EF4444' : '#86B573',
                color: rider.is_active ? '#EF4444' : '#86B573',
              }}
            >
              {rider.is_active ? 'تعطيل' : 'تفعيل'}
            </Button>
          )}
        </Box>
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
              <strong>الهاتف:</strong> {rider.phone}
            </Typography>
            <Typography variant="body2">
              <strong>نوع المركبة:</strong> {getVehicleLabel(rider.vehicle_type)}
            </Typography>
            {rider.vehicle_plate && (
              <Typography variant="body2">
                <strong>لوحة المركبة:</strong> {rider.vehicle_plate}
              </Typography>
            )}
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
              <strong>موافقة الأدمن:</strong>{' '}
              <Chip
                label={pendingApproval ? 'بانتظار الموافقة' : 'موافق عليه'}
                size="small"
                sx={{
                  bgcolor: pendingApproval ? '#F59E0B20' : '#22C55E20',
                  color: pendingApproval ? '#D97706' : '#22C55E',
                }}
              />
            </Typography>
            <Typography variant="body2">
              <strong>نشط:</strong> {rider.is_active ? 'نعم' : 'لا'}
            </Typography>
            <Typography variant="body2">
              <strong>عدد التوصيلات:</strong> {rider.total_deliveries}
            </Typography>
            <Typography variant="body2">
              <strong>التقييم:</strong> {rider.rating?.toFixed(1) || '-'} ⭐ ({rider.rating_count} تقييم)
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
              <StarIcon /> التقييمات والمراجعات
            </Typography>
            {reviewsData?.notice && (
              <Typography variant="caption" sx={{ color: '#D97706', display: 'block', mb: 1 }}>
                {reviewsData.notice}
              </Typography>
            )}
            {reviewsData?.apiUnavailable ? (
              <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
                تقييمات السائق غير متاحة. جرّب إصلاح GET /admin/reviews أو GET /riders/&#123;id&#125;/reviews
                (flutter-reviews-api.md).
              </Typography>
            ) : displayReviews && displayReviews.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {displayReviews.map((r) => (
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
                        {r.userName}
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
                      {format(new Date(r.createdAt), 'dd MMM yyyy', { locale: ar })}
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
