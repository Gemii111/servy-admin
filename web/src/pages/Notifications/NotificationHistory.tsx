import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetNotifications,
  mockResendNotification,
  mockDeleteNotification,
  Notification,
  NotificationStatus,
  TargetAudience,
} from '../../services/api/notifications';

const NotificationHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [targetAudienceFilter, setTargetAudienceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'history', targetAudienceFilter, statusFilter, page],
    queryFn: () =>
      mockGetNotifications({
        targetAudience: targetAudienceFilter as TargetAudience | 'all',
        status: statusFilter as NotificationStatus | 'all',
        page,
        limit,
      }),
  });

  const resendMutation = useMutation({
    mutationFn: mockResendNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showSnackbar('تم إعادة إرسال الإشعار بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء إعادة إرسال الإشعار', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: mockDeleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showSnackbar('تم حذف الإشعار بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء حذف الإشعار', 'error');
    },
  });

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailsDialogOpen(true);
  };

  const handleResend = (notification: Notification) => {
    if (window.confirm('هل أنت متأكد من إعادة إرسال هذا الإشعار؟')) {
      resendMutation.mutate(notification.id);
    }
  };

  const handleDelete = (notification: Notification) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
      deleteMutation.mutate(notification.id);
    }
  };

  const getStatusColor = (status: NotificationStatus) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'scheduled':
        return 'warning';
      case 'failed':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: NotificationStatus) => {
    switch (status) {
      case 'sent':
        return 'تم الإرسال';
      case 'scheduled':
        return 'مجدول';
      case 'failed':
        return 'فشل';
      case 'draft':
        return 'مسودة';
      default:
        return status;
    }
  };

  const getTargetLabel = (target: TargetAudience) => {
    switch (target) {
      case 'all':
        return 'جميع المستخدمين';
      case 'customers':
        return 'العملاء';
      case 'drivers':
        return 'السائقون';
      case 'restaurants':
        return 'المطاعم';
      case 'specific':
        return 'مستخدمون محددون';
      default:
        return target;
    }
  };

  const columns = useMemo<ColumnDef<Notification>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'العنوان',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'targetAudience',
        header: 'الجمهور المستهدف',
        cell: (info) => (
          <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
            {getTargetLabel(info.getValue() as TargetAudience)}
          </Typography>
        ),
      },
      {
        accessorKey: 'sentCount',
        header: 'عدد المستلمين',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: (info) => {
          const status = info.getValue() as NotificationStatus;
          return (
            <Chip
              label={getStatusLabel(status)}
              size="small"
              color={getStatusColor(status) as any}
              sx={{
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'sentAt',
        header: 'تاريخ الإرسال',
        cell: (info) => {
          const value = info.getValue();
          if (!value) return <Typography sx={{ color: '#9CA3AF' }}>-</Typography>;
          return (
            <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
              {format(new Date(String(value)), 'dd MMM yyyy, HH:mm', { locale: ar })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'adminName',
        header: 'أرسل بواسطة',
        cell: (info) => (
          <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return <SkeletonLoader variant="table" />;
  }

  if (!data || data.notifications.length === 0) {
    return <EmptyState title="لا توجد إشعارات" description="لم يتم العثور على أي إشعارات." />;
  }

  return (
    <Box sx={{ color: '#E5E7EB' }}>
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            mb={0.5}
            sx={{ fontSize: { xs: 20, sm: 24 } }}
          >
            سجل الإشعارات
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            عرض جميع الإشعارات المرسلة والمجدولة
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => navigate('/notifications/templates')}
            size="small"
            sx={{
              borderColor: '#F59E0B',
              color: '#F59E0B',
              '&:hover': {
                borderColor: '#D97706',
                bgcolor: '#F59E0B10',
              },
            }}
          >
            القوالب
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate('/notifications/statistics')}
            size="small"
            sx={{
              borderColor: '#2563EB',
              color: '#2563EB',
              '&:hover': {
                borderColor: '#3B82F6',
                bgcolor: '#2563EB10',
              },
            }}
          >
            الإحصائيات
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          mb: 2,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>الجمهور المستهدف</InputLabel>
          <Select
            value={targetAudienceFilter}
            onChange={(e) => {
              setTargetAudienceFilter(e.target.value);
              setPage(1);
            }}
            sx={{
              bgcolor: '#020617',
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
            }}
            label="الجمهور المستهدف"
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="all">جميع المستخدمين</MenuItem>
            <MenuItem value="customers">العملاء</MenuItem>
            <MenuItem value="drivers">السائقون</MenuItem>
            <MenuItem value="restaurants">المطاعم</MenuItem>
            <MenuItem value="specific">مستخدمون محددون</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>الحالة</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            sx={{
              bgcolor: '#020617',
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
            }}
            label="الحالة"
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="sent">تم الإرسال</MenuItem>
            <MenuItem value="scheduled">مجدول</MenuItem>
            <MenuItem value="failed">فشل</MenuItem>
            <MenuItem value="draft">مسودة</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DataTable
        data={data.notifications}
        columns={columns}
        isLoading={isLoading}
        searchable={false}
        onView={handleView}
        onEdit={(notification) => handleResend(notification)}
        onDelete={handleDelete}
      />

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #1F2937',
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>تفاصيل الإشعار</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  العنوان
                </Typography>
                <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                  {selectedNotification.title}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  الرسالة
                </Typography>
                <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                  {selectedNotification.message}
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    الجمهور المستهدف
                  </Typography>
                  <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                    {getTargetLabel(selectedNotification.targetAudience)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    عدد المستلمين
                  </Typography>
                  <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                    {selectedNotification.sentCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    الحالة
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedNotification.status)}
                    size="small"
                    color={getStatusColor(selectedNotification.status) as any}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    تاريخ الإرسال
                  </Typography>
                  <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                    {selectedNotification.sentAt
                      ? format(new Date(selectedNotification.sentAt), 'dd MMM yyyy, HH:mm', {
                          locale: ar,
                        })
                      : '-'}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  حالة التسليم
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography sx={{ color: '#22C55E', fontSize: 13 }}>
                    تم التسليم: {selectedNotification.deliveryStatus.delivered}
                  </Typography>
                  <Typography sx={{ color: '#EF4444', fontSize: 13 }}>
                    فشل: {selectedNotification.deliveryStatus.failed}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationHistoryPage;

