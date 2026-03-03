import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetCampaigns,
  mockSendCampaignNotification,
  Campaign,
  getCampaignStatusLabel,
  getCampaignUserSegmentLabel,
} from '../../services/api/campaigns';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import SendIcon from '@mui/icons-material/Send';

const CampaignsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', statusFilter],
    queryFn: () => mockGetCampaigns({ status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: mockSendCampaignNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showSnackbar('تم إرسال الإشعار بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('فشل إرسال الإشعار', 'error');
    },
  });

  const columns = useMemo<ColumnDef<Campaign>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'اسم الحملة',
        cell: (info) => (
          <Typography sx={{ color: '#1A2E1A', fontWeight: 600, fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'description',
        header: 'الوصف',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }} noWrap>
            {String(info.getValue() || '-')}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: (info) => {
          const status = String(info.getValue());
          const colors: Record<string, string> = {
            active: '#22C55E',
            inactive: '#5A6A5A',
            expired: '#EF4444',
          };
          return (
            <Chip
              label={getCampaignStatusLabel(status)}
              size="small"
              sx={{
                bgcolor: `${colors[status] || '#5A6A5A'}20`,
                color: colors[status] || '#5A6A5A',
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'user_segment',
        header: 'شريحة المستخدم',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {getCampaignUserSegmentLabel(info.getValue() as any)}
          </Typography>
        ),
      },
      {
        accessorKey: 'notification_sent',
        header: 'إشعار',
        cell: (info) => (
          <Chip
            label={info.getValue() ? 'مرسل' : 'لم يُرسل'}
            size="small"
            sx={{
              bgcolor: info.getValue() ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: info.getValue() ? '#22C55E' : '#F59E0B',
              fontSize: 12,
            }}
          />
        ),
      },
      {
        accessorKey: 'end_date',
        header: 'ينتهي في',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {format(new Date(String(info.getValue())), 'dd MMM yyyy', { locale: ar })}
          </Typography>
        ),
      },
      {
        id: 'send_notification',
        header: 'إجراء',
        cell: ({ row }) => {
          const campaign = row.original;
          return (
            <Button
              size="small"
              variant="outlined"
              startIcon={<SendIcon />}
              disabled={campaign.notification_sent || sendNotificationMutation.isPending}
              onClick={() => sendNotificationMutation.mutate(campaign.id)}
              sx={{
                borderColor: '#86B573',
                color: '#86B573',
                '&:hover': { borderColor: '#6B9B5E', bgcolor: 'rgba(134, 181, 115, 0.08)' },
              }}
            >
              إرسال إشعار
            </Button>
          );
        },
      },
    ],
    [sendNotificationMutation.isPending]
  );

  if (isLoading) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  const campaigns = data || [];

  return (
    <Box sx={{ color: '#1A2E1A' }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5} sx={{ fontSize: { xs: 20, sm: 24 } }}>
            الحملات
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A', fontSize: { xs: 12, sm: 14 } }}>
            إدارة الحملات التسويقية والعروض
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>الحالة</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="الحالة"
            sx={{
              bgcolor: '#FFFFFF',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B1C0B1' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#86B573' },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="active">نشط</MenuItem>
            <MenuItem value="inactive">غير نشط</MenuItem>
            <MenuItem value="expired">منتهي</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {campaigns.length === 0 ? (
        <EmptyState
          title="لا توجد حملات"
          description="لم يتم العثور على حملات تطابق الفلاتر المحددة."
        />
      ) : (
        <DataTable data={campaigns} columns={columns} searchable={false} isLoading={isLoading} />
      )}
    </Box>
  );
};

export default CampaignsListPage;
