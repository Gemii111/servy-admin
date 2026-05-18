import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  getRestaurantById,
  setRestaurantVerified,
  deleteRestaurant,
} from '../../services/api/restaurants';
import RestaurantMenuPanel from '../../components/restaurants/RestaurantMenuPanel';

const RestaurantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurantById(id!),
    enabled: !!id,
  });

  const verifiedMutation = useMutation({
    mutationFn: (checked: boolean) => setRestaurantVerified(id!, checked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', id] });
      showSnackbar('تم تحديث حالة التوثيق', 'success');
    },
    onError: (e: Error) => showSnackbar(e.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRestaurant(id!),
    onSuccess: () => {
      showSnackbar('تم حذف المتجر', 'success');
      navigate('/restaurants');
    },
    onError: (e: Error) => showSnackbar(e.message, 'error'),
  });

  if (isLoading) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  if (!restaurant) {
    return (
      <EmptyState
        title="المطعم غير موجود"
        description="لم يتم العثور على المطعم المطلوب."
      />
    );
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    approved: { label: 'موافق عليه', color: '#22C55E' },
    pending: { label: 'قيد المراجعة', color: '#F59E0B' },
    suspended: { label: 'معطل', color: '#EF4444' },
  };

  const status = statusConfig[restaurant.status] || {
    label: restaurant.status,
    color: '#5A6A5A',
  };

  return (
    <Box sx={{ color: '#1A2E1A' }}>
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
            onClick={() => navigate('/restaurants')}
            sx={{
              color: '#5A6A5A',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" fontWeight={700} mb={0.5}>
                {restaurant.name}
              </Typography>
              {restaurant.isVerifiedSeller && (
                <VerifiedIcon sx={{ color: '#86B573', fontSize: 22 }} />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
              تفاصيل المطعم
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/restaurants/${id}/edit`)}
          >
            تعديل
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف المطعم "${restaurant.name}"؟`)) {
                deleteMutation.mutate();
              }
            }}
          >
            حذف
          </Button>
        </Box>
      </Box>

      {/* Main Info Card */}
      <Paper
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          border: '1px solid #B1C0B1',
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#1A2E1A', mb: 3, fontWeight: 600 }}>
          المعلومات الأساسية
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              اسم المطعم
            </Typography>
            <Typography variant="body1" sx={{ color: '#1A2E1A', fontWeight: 500 }}>
              {restaurant.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              صاحب المطعم
            </Typography>
            <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
              {restaurant.ownerName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              البريد الإلكتروني
            </Typography>
            <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
              {restaurant.ownerEmail}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              رقم الهاتف
            </Typography>
            <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
              {restaurant.phone}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              نوع المطبخ
            </Typography>
            <Chip
              label={restaurant.cuisineType}
              size="small"
              sx={{
                bgcolor: '#86B57320',
                color: '#86B573',
                fontWeight: 500,
              }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              الحالة
            </Typography>
            <Chip
              label={status.label}
              size="small"
              sx={{
                bgcolor: `${status.color}20`,
                color: status.color,
                fontWeight: 500,
              }}
            />
          </Box>
          {restaurant.address && (
            <Box>
              <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
                العنوان
            </Typography>
              <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
                {restaurant.address}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              تاريخ التسجيل
            </Typography>
            <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
              {format(new Date(restaurant.createdAt), 'dd MMM yyyy', { locale: ar })}
            </Typography>
          </Box>
        </Box>

        {restaurant.description && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              الوصف
            </Typography>
            <Typography variant="body2" sx={{ color: '#1A2E1A' }}>
              {restaurant.description}
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #B1C0B1', p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#1A2E1A', mb: 2, fontWeight: 600 }}>
          عناصر الثقة
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={restaurant.isVerifiedSeller ?? false}
              onChange={(e) => verifiedMutation.mutate(e.target.checked)}
              disabled={verifiedMutation.isPending}
            />
          }
          label="بائع موثّق (يظهر في تطبيق العميل)"
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <Typography variant="body2">
            <strong>دفع آمن:</strong> {restaurant.supportsSecurePayment ? 'نعم' : 'لا'}
          </Typography>
          <Typography variant="body2">
            <strong>شارة التوصيل:</strong> {restaurant.deliveryBadgeLabel || '—'}
          </Typography>
          <Typography variant="body2">
            <strong>ضمان التوصيل:</strong> {restaurant.deliveryGuarantee || '—'}
          </Typography>
          <Typography variant="body2">
            <strong>طرق الدفع:</strong>{' '}
            {(restaurant.acceptedPaymentMethods ?? []).join(', ') || '—'}
          </Typography>
          {restaurant.returnPolicySummary && (
            <Typography variant="body2" sx={{ gridColumn: '1 / -1' }}>
              <strong>الاسترجاع:</strong> {restaurant.returnPolicySummary}
            </Typography>
          )}
        </Box>
      </Paper>

      <Paper sx={{ bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #B1C0B1', p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#1A2E1A', mb: 2, fontWeight: 600 }}>
          قائمة المنيو
        </Typography>
        <Typography variant="body2" sx={{ color: '#5A6A5A', mb: 2 }}>
          تفعيل أو تعطيل توفر الأصناف مباشرة من لوحة الأدمن
        </Typography>
        {id && <RestaurantMenuPanel restaurantId={id} />}
      </Paper>

      {/* Statistics */}
      <Paper
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          border: '1px solid #B1C0B1',
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#1A2E1A', mb: 3, fontWeight: 600 }}>
          الإحصائيات
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 3,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              border: '1px solid #B1C0B1',
            }}
          >
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 1 }}>
              إجمالي الطلبات
            </Typography>
            <Typography variant="h5" sx={{ color: '#1A2E1A', fontWeight: 700 }}>
              {restaurant.totalOrders}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              border: '1px solid #B1C0B1',
            }}
          >
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 1 }}>
              إجمالي الإيرادات
            </Typography>
            <Typography variant="h5" sx={{ color: '#1A2E1A', fontWeight: 700 }}>
              {restaurant.totalRevenue} ر.س
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              border: '1px solid #B1C0B1',
            }}
          >
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 1 }}>
              التقييم
            </Typography>
            <Typography variant="h5" sx={{ color: '#1A2E1A', fontWeight: 700 }}>
              ⭐ {restaurant.rating}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              border: '1px solid #B1C0B1',
            }}
          >
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 1 }}>
              متوسط قيمة الطلب
            </Typography>
            <Typography variant="h5" sx={{ color: '#1A2E1A', fontWeight: 700 }}>
              {restaurant.totalOrders > 0
                ? Math.round(restaurant.totalRevenue / restaurant.totalOrders)
                : 0}{' '}
              ر.س
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RestaurantDetailsPage;

