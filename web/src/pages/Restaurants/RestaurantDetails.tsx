import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Chip, IconButton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { mockGetRestaurantById } from '../../services/api/restaurants';

const RestaurantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => mockGetRestaurantById(id!),
    enabled: !!id,
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
    color: '#9CA3AF',
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
            onClick={() => navigate('/restaurants')}
            sx={{
              color: '#9CA3AF',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700} mb={0.5}>
              {restaurant.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
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
                // Handle delete
                navigate('/restaurants');
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
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
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
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              اسم المطعم
            </Typography>
            <Typography variant="body1" sx={{ color: '#E5E7EB', fontWeight: 500 }}>
              {restaurant.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              صاحب المطعم
            </Typography>
            <Typography variant="body1" sx={{ color: '#E5E7EB' }}>
              {restaurant.ownerName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              البريد الإلكتروني
            </Typography>
            <Typography variant="body1" sx={{ color: '#E5E7EB' }}>
              {restaurant.ownerEmail}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              رقم الهاتف
            </Typography>
            <Typography variant="body1" sx={{ color: '#E5E7EB' }}>
              {restaurant.phone}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              نوع المطبخ
            </Typography>
            <Chip
              label={restaurant.cuisineType}
              size="small"
              sx={{
                bgcolor: '#2563EB20',
                color: '#2563EB',
                fontWeight: 500,
              }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
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
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                العنوان
            </Typography>
              <Typography variant="body1" sx={{ color: '#E5E7EB' }}>
                {restaurant.address}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              تاريخ التسجيل
            </Typography>
            <Typography variant="body1" sx={{ color: '#E5E7EB' }}>
              {format(new Date(restaurant.createdAt), 'dd MMM yyyy', { locale: ar })}
            </Typography>
          </Box>
        </Box>

        {restaurant.description && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              الوصف
            </Typography>
            <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
              {restaurant.description}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Statistics */}
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
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
              bgcolor: '#020617',
              border: '1px solid #1F2937',
            }}
          >
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
              إجمالي الطلبات
            </Typography>
            <Typography variant="h5" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
              {restaurant.totalOrders}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#020617',
              border: '1px solid #1F2937',
            }}
          >
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
              إجمالي الإيرادات
            </Typography>
            <Typography variant="h5" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
              {restaurant.totalRevenue} ر.س
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#020617',
              border: '1px solid #1F2937',
            }}
          >
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
              التقييم
            </Typography>
            <Typography variant="h5" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
              ⭐ {restaurant.rating}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#020617',
              border: '1px solid #1F2937',
            }}
          >
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
              متوسط قيمة الطلب
            </Typography>
            <Typography variant="h5" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
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

