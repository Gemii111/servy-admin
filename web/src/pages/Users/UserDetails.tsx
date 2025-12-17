import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Chip, IconButton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { mockGetUserById } from '../../services/api/users';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => mockGetUserById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <SkeletonLoader variant="table" count={3} />;
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2 }}>
          المستخدم غير موجود
        </Typography>
        <Button variant="contained" onClick={() => navigate('/users')}>
          العودة إلى القائمة
        </Button>
      </Box>
    );
  }

  const userTypeLabels: Record<string, { label: string; color: string }> = {
    customer: { label: 'عميل', color: '#2563EB' },
    driver: { label: 'سائق', color: '#22C55E' },
    restaurant: { label: 'مطعم', color: '#F59E0B' },
  };

  const typeConfig = userTypeLabels[user.userType] || {
    label: user.userType,
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
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/users')} sx={{ color: '#9CA3AF' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              تفاصيل المستخدم
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              عرض معلومات المستخدم الكاملة
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/users/${user.id}/edit`)}
          >
            تعديل
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
                // Handle delete
                navigate('/users');
              }
            }}
          >
            حذف
          </Button>
        </Box>
      </Box>

      {/* User Info Card */}
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2.5, fontWeight: 600 }}>
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
              الاسم الكامل
            </Typography>
            <Typography variant="body1" sx={{ color: '#E5E7EB', fontWeight: 500 }}>
              {user.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              البريد الإلكتروني
            </Typography>
            <Typography variant="body1" sx={{ color: '#E5E7EB' }}>
              {user.email}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              رقم الهاتف
            </Typography>
            <Typography variant="body1" sx={{ color: '#E5E7EB' }}>
              {user.phone}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              نوع المستخدم
            </Typography>
            <Chip
              label={typeConfig.label}
              size="small"
              sx={{
                bgcolor: `${typeConfig.color}20`,
                color: typeConfig.color,
                fontWeight: 500,
              }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              الحالة
            </Typography>
            <Chip
              label={user.status === 'active' ? 'نشط' : 'معطل'}
              size="small"
              sx={{
                bgcolor: user.status === 'active' ? '#22C55E20' : '#EF444420',
                color: user.status === 'active' ? '#22C55E' : '#EF4444',
                fontWeight: 500,
              }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              تاريخ التسجيل
            </Typography>
            <Typography variant="body1" sx={{ color: '#E5E7EB' }}>
              {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: ar })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Card */}
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2.5, fontWeight: 600 }}>
          الإحصائيات
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
              {user.totalOrders}
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
              إجمالي الإنفاق
            </Typography>
            <Typography variant="h5" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
              {user.totalSpent} ر.س
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserDetailsPage;

