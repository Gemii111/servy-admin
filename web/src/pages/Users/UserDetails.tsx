import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Paper, Button, Chip, IconButton, Avatar, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { getUserById } from '../../services/api/users';
import ResetPasswordDialog from './ResetPasswordDialog';
import UserApiFieldsGrid from '../../components/users/UserApiFieldsGrid';
import ApiDataSourceBanner from '../../components/common/ApiDataSourceBanner';
import { getApiDataSource } from '../../services/api/base';
import { formatApiDateTime } from '../../utils/apiDates';

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <SkeletonLoader variant="table" count={3} />;
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" sx={{ color: '#1A2E1A', mb: 2 }}>
          المستخدم غير موجود
        </Typography>
        <Button variant="contained" onClick={() => navigate('/users')}>
          العودة إلى القائمة
        </Button>
      </Box>
    );
  }

  const userTypeLabels: Record<string, { label: string; color: string }> = {
    customer: { label: 'عميل', color: '#86B573' },
    driver: { label: 'سائق', color: '#22C55E' },
    restaurant: { label: 'مطعم', color: '#F59E0B' },
  };

  const typeConfig = userTypeLabels[user.userType] || {
    label: user.userType,
    color: '#5A6A5A',
  };

  const dataSource = getApiDataSource();
  const apiFieldCount = Object.keys(user.apiRaw).length;
  const lastSeenRaw = user.apiRaw.last_seen_at ?? user.apiRaw.lastSeenAt;
  const lastSeenHasKey = 'last_seen_at' in user.apiRaw || 'lastSeenAt' in user.apiRaw;
  const lastSeenIsNull =
    lastSeenHasKey && (lastSeenRaw === null || lastSeenRaw === undefined || lastSeenRaw === '');

  return (
    <Box sx={{ color: '#1A2E1A' }}>
      <ApiDataSourceBanner />
      {dataSource === 'real' && !user.apiHasExtendedFields && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          السيرفر لم يرسل الحقول الموسّعة بعد (first_name, last_login_at, …). راجع{' '}
          <code>flutter-admin-users-fields.md</code>.
        </Alert>
      )}
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
          <IconButton onClick={() => navigate('/users')} sx={{ color: '#5A6A5A' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              تفاصيل المستخدم
            </Typography>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
              عرض معلومات المستخدم الكاملة
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setResetOpen(true)}>
            إعادة تعيين كلمة المرور
          </Button>
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
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          border: '1px solid #B1C0B1',
          p: 3,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Avatar
            src={user.imageUrl ?? undefined}
            sx={{ width: 56, height: 56, bgcolor: '#86B573' }}
          >
            {(user.firstName || user.name).charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ color: '#1A2E1A', fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
              {user.email?.trim() || user.phone || '—'}
            </Typography>
            {!user.email?.trim() && user.phone && (
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                البريد غير مسجّل في قاعدة البيانات
              </Typography>
            )}
          </Box>
        </Box>
        <Typography variant="subtitle2" sx={{ color: '#1A2E1A', mb: 2, fontWeight: 600 }}>
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
              معرّف المستخدم (id)
            </Typography>
            <Typography variant="body2" sx={{ color: '#1A2E1A', fontFamily: 'monospace', fontSize: 12 }}>
              {user.id}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              الاسم الأول
            </Typography>
            <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
              {user.firstName || '—'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              اسم العائلة
            </Typography>
            <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
              {user.lastName || '—'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              البريد الإلكتروني
            </Typography>
            <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
              {user.email?.trim() || '—'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              رقم الهاتف
            </Typography>
            <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
              {user.phone}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
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
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              حالة الحساب
            </Typography>
            <Chip
              label={user.status === 'active' ? 'نشط (مفعّل)' : 'معطل'}
              size="small"
              sx={{
                bgcolor: user.status === 'active' ? '#22C55E20' : '#EF444420',
                color: user.status === 'active' ? '#22C55E' : '#EF4444',
                fontWeight: 500,
              }}
            />
          </Box>
          {user.apiHasExtendedFields && (
            <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              تأكيد البريد
            </Typography>
            <Typography variant="body2" sx={{ color: '#5A6A5A', mb: 0.5, fontSize: 11 }}>
              تأكيد عنوان البريد فقط — ليس موافقة السائق
            </Typography>
              <Chip
                label={user.isEmailVerified ? 'موثّق' : 'غير موثّق'}
                size="small"
                sx={{
                  bgcolor: user.isEmailVerified ? '#22C55E20' : '#9CA3AF20',
                  color: user.isEmailVerified ? '#22C55E' : '#6B7280',
                }}
              />
            </Box>
          )}
          {user.userType === 'restaurant' && (
            <Box>
              <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
                مطعم مرتبط (restaurant_id)
              </Typography>
              {user.restaurantId ? (
                <Typography
                  component={Link}
                  to={`/restaurants/${user.restaurantId}`}
                  variant="body2"
                  sx={{ color: '#2563EB', fontFamily: 'monospace' }}
                >
                  {user.restaurantId}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
                  —
                </Typography>
              )}
            </Box>
          )}
          <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              تاريخ التسجيل
            </Typography>
            <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
              {formatApiDateTime(user.createdAt)}
            </Typography>
          </Box>
          {user.updatedAt && (
            <Box>
              <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
                آخر تحديث
              </Typography>
              <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
                {formatApiDateTime(user.updatedAt)}
              </Typography>
            </Box>
          )}
          {user.apiHasExtendedFields && (
            <>
              <Box>
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
              آخر تسجيل دخول
            </Typography>
                <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
                  {formatApiDateTime(user.lastLoginAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 0.5 }}>
                  آخر نشاط للملف (last_seen_at)
                </Typography>
                <Typography variant="body1" sx={{ color: '#1A2E1A' }}>
                  {lastSeenIsNull ? '—' : formatApiDateTime(user.lastSeenAt)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mt: 0.5 }}>
                  {lastSeenIsNull
                    ? 'السيرفر أرسل null — لم يُحدَّث نشاط الملف بعد. يُحدَّث عند تعديل الملف الشخصي فقط، وليس «متصل الآن».'
                    : 'من users.last_activity — يتحدّث عند تعديل الملف، وليس عند كل استخدام للتطبيق.'}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {dataSource === 'real' && (
        <Paper
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: 2,
            border: '1px solid #B1C0B1',
            p: 3,
            mb: 3,
          }}
        >
          <Alert severity="info" sx={{ mb: 2 }}>
            كل ما يظهر أدناه هو ما أرسله الباكند في <code>GET /admin/users/:id</code> ({apiFieldCount}{' '}
            حقل). نقاط الولاء من endpoint منفصل إن وُجدت.
          </Alert>
          <UserApiFieldsGrid
            title={`استجابة السيرفر الكاملة (${apiFieldCount} حقل)`}
            fields={user.apiRaw}
            hideKeys={
              new Set(['password', 'password_hash', 'Password', 'PasswordHash', '_originalEnvelope'])
            }
          />
        </Paper>
      )}

      {/* Statistics Card */}
      <Paper
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          border: '1px solid #B1C0B1',
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#1A2E1A', mb: 2.5, fontWeight: 600 }}>
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
              bgcolor: '#FFFFFF',
              border: '1px solid #B1C0B1',
            }}
          >
            <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 1 }}>
              إجمالي الطلبات
            </Typography>
            <Typography variant="h5" sx={{ color: '#1A2E1A', fontWeight: 700 }}>
              {user.totalOrders}
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
              إجمالي الإنفاق
            </Typography>
            <Typography variant="h5" sx={{ color: '#1A2E1A', fontWeight: 700 }}>
              {user.totalSpent} ر.س
            </Typography>
          </Box>
          {user.loyaltyPoints != null && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                border: '1px solid #B1C0B1',
              }}
            >
              <Typography variant="caption" sx={{ color: '#5A6A5A', display: 'block', mb: 1 }}>
                نقاط الولاء
              </Typography>
              <Typography variant="h5" sx={{ color: '#1A2E1A', fontWeight: 700 }}>
                {user.loyaltyPoints}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <ResetPasswordDialog
        open={resetOpen}
        userId={user.id}
        userName={user.name}
        onClose={() => setResetOpen(false)}
      />
    </Box>
  );
};

export default UserDetailsPage;

