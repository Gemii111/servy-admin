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
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  getNotificationHistory,
  NotificationHistoryItem,
} from '../../services/api/notifications';

const NotificationHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<NotificationHistoryItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'history', targetTypeFilter, page],
    queryFn: () =>
      getNotificationHistory({
        targetType:
          targetTypeFilter === 'all'
            ? undefined
            : (targetTypeFilter as 'user' | 'topic'),
        page,
        limit,
      }),
  });

  const columns = useMemo<ColumnDef<NotificationHistoryItem>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'العنوان',
        cell: (info) => (
          <Typography sx={{ color: '#1A2E1A', fontWeight: 500, fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'targetType',
        header: 'الهدف',
        cell: (info) => (
          <Chip
            size="small"
            label={info.getValue() === 'topic' ? 'موضوع (Topic)' : 'مستخدم'}
            sx={{ fontSize: 12 }}
          />
        ),
      },
      {
        accessorKey: 'targetValue',
        header: 'القيمة',
        cell: (info) => (
          <Typography
            sx={{
              color: '#5A6A5A',
              fontSize: 12,
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'success',
        header: 'التسليم',
        cell: (info) => {
          const ok = Boolean(info.getValue());
          return (
            <Chip
              size="small"
              label={ok ? 'نجح' : 'فشل'}
              color={ok ? 'success' : 'error'}
              sx={{ fontSize: 12 }}
            />
          );
        },
      },
      {
        accessorKey: 'sentByAdmin',
        header: 'أرسل بواسطة',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {String(info.getValue() || '—')}
          </Typography>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'التاريخ',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {format(new Date(String(info.getValue())), 'dd MMM yyyy, HH:mm', { locale: ar })}
          </Typography>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return <SkeletonLoader variant="table" />;
  }

  const items = data?.items ?? [];

  return (
    <Box sx={{ color: '#1A2E1A' }}>
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
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            سجل الإشعارات
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
            كل إشعار أُرسل من لوحة الأدمن (نجاح أو فشل FCM)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => navigate('/notifications/templates')}
            size="small"
          >
            القوالب
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate('/notifications/statistics')}
            size="small"
            sx={{ borderColor: '#86B573', color: '#86B573' }}
          >
            الإحصائيات
          </Button>
        </Box>
      </Box>

      <FormControl size="small" sx={{ minWidth: 160, mb: 2 }}>
        <InputLabel>نوع الهدف</InputLabel>
        <Select
          value={targetTypeFilter}
          label="نوع الهدف"
          onChange={(e) => {
            setTargetTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="all">الكل</MenuItem>
          <MenuItem value="user">مستخدم</MenuItem>
          <MenuItem value="topic">موضوع (Topic)</MenuItem>
        </Select>
      </FormControl>

      {items.length === 0 ? (
        <EmptyState
          title="لا توجد سجلات"
          description="لم يُرسل أي إشعار بعد، أو لا توجد نتائج للفلتر."
        />
      ) : (
        <DataTable
          data={items}
          columns={columns}
          searchable={false}
          onView={(row) => {
            setSelected(row);
            setDetailsOpen(true);
          }}
        />
      )}

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>تفاصيل الإشعار</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  العنوان
                </Typography>
                <Typography>{selected.title}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  النص
                </Typography>
                <Typography>{selected.body}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  الهدف
                </Typography>
                <Typography>
                  {selected.targetType}: {selected.targetValue}
                </Typography>
              </Box>
              {!selected.success && selected.errorMessage && (
                <Box>
                  <Typography variant="caption" color="error">
                    خطأ FCM
                  </Typography>
                  <Typography color="error">{selected.errorMessage}</Typography>
                </Box>
              )}
              {selected.data && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    بيانات إضافية
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {selected.data}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationHistoryPage;
