import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetUserRewardsHistory,
  mockRevokeReward,
  mockExtendReward,
  UserReward,
  UserRewardStatus,
} from '../../services/api/rewards';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const RewardsHistoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<UserReward | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [extendDays, setExtendDays] = useState(30);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rewardTypeFilter, setRewardTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['rewards-history', statusFilter, rewardTypeFilter, dateFrom, dateTo],
    queryFn: () =>
      mockGetUserRewardsHistory({
        status: statusFilter !== 'all' ? (statusFilter as UserRewardStatus) : undefined,
        rewardType: rewardTypeFilter !== 'all' ? rewardTypeFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  });

  const rewards = historyData?.userRewards || [];

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      mockRevokeReward(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards-history'] });
      showSnackbar('تم إلغاء الجائزة بنجاح', 'success');
      setRevokeDialogOpen(false);
      setRevokeReason('');
      setDetailsDialogOpen(false);
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء إلغاء الجائزة', 'error');
    },
  });

  const extendMutation = useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      mockExtendReward(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards-history'] });
      showSnackbar('تم تمديد صلاحية الجائزة بنجاح', 'success');
      setExtendDialogOpen(false);
      setExtendDays(30);
      setDetailsDialogOpen(false);
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء تمديد الجائزة', 'error');
    },
  });


  const getStatusLabel = (status: UserRewardStatus) => {
    const labels: Record<UserRewardStatus, string> = {
      active: 'نشط',
      used: 'مستخدم',
      expired: 'منتهي',
      revoked: 'ملغي',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: UserRewardStatus) => {
    const colors: Record<UserRewardStatus, string> = {
      active: '#22C55E',
      used: '#2563EB',
      expired: '#9CA3AF',
      revoked: '#EF4444',
    };
    return colors[status] || '#9CA3AF';
  };

  const getRewardTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      discount_coupon: 'كوبون خصم',
      free_delivery: 'توصيل مجاني',
      cash_credit: 'رصيد نقدي',
      free_item: 'عنصر مجاني',
      points: 'نقاط',
      custom: 'مخصص',
    };
    return labels[type] || type;
  };

  const handleViewDetails = (reward: UserReward) => {
    setSelectedReward(reward);
    setDetailsDialogOpen(true);
  };

  const handleRevoke = () => {
    if (!selectedReward) return;
    if (!revokeReason.trim()) {
      showSnackbar('الرجاء إدخال سبب الإلغاء', 'warning');
      return;
    }
    revokeMutation.mutate({ id: selectedReward.id, reason: revokeReason });
  };

  const handleExtend = () => {
    if (!selectedReward) return;
    if (extendDays <= 0) {
      showSnackbar('الرجاء إدخال عدد أيام صحيح', 'warning');
      return;
    }
    extendMutation.mutate({ id: selectedReward.id, days: extendDays });
  };

  const columns = useMemo<ColumnDef<UserReward>[]>(
    () => [
      {
        accessorKey: 'user',
        header: 'المستخدم',
        cell: (info) => {
          const user = (info.getValue() as { name: string; email: string }) || {};
          return (
            <Box>
              <Typography sx={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>
                {user.name || '-'}
              </Typography>
              <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
                {user.email || '-'}
              </Typography>
            </Box>
          );
        },
      },
      {
        accessorKey: 'reward',
        header: 'الجائزة',
        cell: (info) => {
          const reward = (info.getValue() as { name: string; rewardType: string }) || {};
          return (
            <Box>
              <Typography sx={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>
                {reward.name || '-'}
              </Typography>
              <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
                {getRewardTypeLabel(reward.rewardType || '')}
              </Typography>
            </Box>
          );
        },
      },
      {
        accessorKey: 'reward',
        id: 'value',
        header: 'القيمة',
        cell: (info) => {
          const reward = (info.getValue() as { rewardValue: number; rewardType: string }) || {};
          const value = reward.rewardValue || 0;
          const type = reward.rewardType || '';
          const suffix =
            type === 'discount_coupon'
              ? '%'
              : type === 'points'
              ? ' نقطة'
              : type === 'cash_credit'
              ? ' ريال'
              : '';
          return (
            <Typography sx={{ color: '#E5E7EB', fontSize: 14, fontWeight: 500 }}>
              {value}
              {suffix}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'assignedAt',
        header: 'تاريخ المنح',
        cell: (info) => {
          const date = info.getValue() as string;
          return (
            <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
              {date ? format(new Date(date), 'dd/MM/yyyy', { locale: ar }) : '-'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'expiresAt',
        header: 'تاريخ الانتهاء',
        cell: (info) => {
          const date = info.getValue() as string;
          return (
            <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
              {date ? format(new Date(date), 'dd/MM/yyyy', { locale: ar }) : '-'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: (info) => {
          const status = info.getValue() as UserRewardStatus;
          return (
            <Chip
              label={getStatusLabel(status)}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(status)}20`,
                color: getStatusColor(status),
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'usedAt',
        header: 'تاريخ الاستخدام',
        cell: (info) => {
          const date = info.getValue() as string;
          return (
            <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
              {date ? format(new Date(date), 'dd/MM/yyyy', { locale: ar }) : '-'}
            </Typography>
          );
        },
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: (info) => {
          const reward = info.row.original as UserReward;
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(reward);
                }}
                sx={{
                  borderColor: '#2563EB',
                  color: '#2563EB',
                  fontSize: 12,
                  '&:hover': {
                    borderColor: '#3B82F6',
                    bgcolor: '#2563EB10',
                  },
                }}
              >
                عرض
              </Button>
            </Box>
          );
        },
      },
    ],
    []
  );

  if (isLoading) {
    return <SkeletonLoader variant="table" />;
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
            سجل الجوائز
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            عرض جميع الجوائز الممنوحة للمستخدمين
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: '#020617',
          borderRadius: 2,
          border: '1px solid #1F2937',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>الحالة</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              bgcolor: '#111827',
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="active">نشط</MenuItem>
            <MenuItem value="used">مستخدم</MenuItem>
            <MenuItem value="expired">منتهي</MenuItem>
            <MenuItem value="revoked">ملغي</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>نوع الجائزة</InputLabel>
          <Select
            value={rewardTypeFilter}
            onChange={(e) => setRewardTypeFilter(e.target.value)}
            sx={{
              bgcolor: '#111827',
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="discount_coupon">كوبون خصم</MenuItem>
            <MenuItem value="free_delivery">توصيل مجاني</MenuItem>
            <MenuItem value="cash_credit">رصيد نقدي</MenuItem>
            <MenuItem value="free_item">عنصر مجاني</MenuItem>
            <MenuItem value="points">نقاط</MenuItem>
            <MenuItem value="custom">مخصص</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="من تاريخ"
          type="date"
          size="small"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            minWidth: { xs: '100%', sm: 150 },
            '& .MuiOutlinedInput-root': {
              bgcolor: '#111827',
              '& fieldset': { borderColor: '#1F2937' },
            },
            input: { color: '#E5E7EB' },
            '& .MuiInputLabel-root': { color: '#9CA3AF' },
          }}
        />

        <TextField
          label="إلى تاريخ"
          type="date"
          size="small"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            minWidth: { xs: '100%', sm: 150 },
            '& .MuiOutlinedInput-root': {
              bgcolor: '#111827',
              '& fieldset': { borderColor: '#1F2937' },
            },
            input: { color: '#E5E7EB' },
            '& .MuiInputLabel-root': { color: '#9CA3AF' },
          }}
        />
      </Box>

      {rewards && rewards.length > 0 ? (
        <DataTable
          data={rewards}
          columns={columns}
          isLoading={isLoading}
          searchable={true}
        />
      ) : (
        <EmptyState
          title="لا توجد جوائز"
          description="لم يتم العثور على أي جوائز ممنوحة."
        />
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedReward(null);
        }}
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
        <DialogTitle sx={{ color: '#E5E7EB' }}>تفاصيل الجائزة</DialogTitle>
        <DialogContent>
          {selectedReward && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mt: 0.5,
              }}
            >
              {/* User Info */}
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Card sx={{ bgcolor: '#020617', border: '1px solid #1F2937' }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: '#9CA3AF', mb: 1.5, fontSize: 12 }}
                    >
                      معلومات المستخدم
                    </Typography>
                    <Typography sx={{ color: '#E5E7EB', fontWeight: 500, mb: 0.5 }}>
                      {selectedReward.userName || '-'}
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
                      {selectedReward.userEmail || '-'}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Reward Info */}
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Card sx={{ bgcolor: '#020617', border: '1px solid #1F2937' }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: '#9CA3AF', mb: 1.5, fontSize: 12 }}
                    >
                      معلومات الجائزة
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>الاسم:</Typography>
                        <Typography sx={{ color: '#E5E7EB', fontSize: 13, fontWeight: 500 }}>
                          {selectedReward.reward?.name || '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>النوع:</Typography>
                        <Typography sx={{ color: '#E5E7EB', fontSize: 13, fontWeight: 500 }}>
                          {getRewardTypeLabel(selectedReward.reward?.rewardType || '')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>القيمة:</Typography>
                        <Typography sx={{ color: '#E5E7EB', fontSize: 13, fontWeight: 500 }}>
                          {selectedReward.reward?.rewardValue || 0}
                          {selectedReward.reward?.rewardType === 'discount_coupon'
                            ? '%'
                            : selectedReward.reward?.rewardType === 'points'
                            ? ' نقطة'
                            : selectedReward.reward?.rewardType === 'cash_credit'
                            ? ' ريال'
                            : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Status & Dates */}
              <Box>
                <Card sx={{ bgcolor: '#020617', border: '1px solid #1F2937' }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: '#9CA3AF', mb: 1.5, fontSize: 12 }}
                    >
                      الحالة
                    </Typography>
                    <Chip
                      label={getStatusLabel(selectedReward.status)}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(selectedReward.status)}20`,
                        color: getStatusColor(selectedReward.status),
                        fontWeight: 500,
                      }}
                    />
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Card sx={{ bgcolor: '#020617', border: '1px solid #1F2937' }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: '#9CA3AF', mb: 1.5, fontSize: 12 }}
                    >
                      التواريخ
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
                        منح: {format(new Date(selectedReward.assignedAt), 'dd/MM/yyyy', { locale: ar })}
                      </Typography>
                      {selectedReward.expiresAt && (
                        <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
                          انتهاء:{' '}
                          {format(new Date(selectedReward.expiresAt), 'dd/MM/yyyy', { locale: ar })}
                        </Typography>
                      )}
                      {selectedReward.usedAt && (
                        <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
                          استخدام:{' '}
                          {format(new Date(selectedReward.usedAt), 'dd/MM/yyyy', { locale: ar })}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {selectedReward.notes && (
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <Card sx={{ bgcolor: '#020617', border: '1px solid #1F2937' }}>
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#9CA3AF', mb: 1, fontSize: 12 }}
                      >
                        ملاحظات
                      </Typography>
                      <Typography sx={{ color: '#E5E7EB', fontSize: 13 }}>
                        {selectedReward.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedReward && selectedReward.status === 'active' && (
            <>
              <Button
                variant="outlined"
                startIcon={<EventAvailableIcon />}
                onClick={() => {
                  setExtendDialogOpen(true);
                }}
                sx={{
                  borderColor: '#F59E0B',
                  color: '#F59E0B',
                  '&:hover': {
                    borderColor: '#D97706',
                    bgcolor: '#F59E0B10',
                  },
                }}
              >
                تمديد
              </Button>
              <Button
                variant="outlined"
                startIcon={<BlockIcon />}
                onClick={() => {
                  setRevokeDialogOpen(true);
                }}
                sx={{
                  borderColor: '#EF4444',
                  color: '#EF4444',
                  '&:hover': {
                    borderColor: '#DC2626',
                    bgcolor: '#EF444410',
                  },
                }}
              >
                إلغاء
              </Button>
            </>
          )}
          <Button onClick={() => setDetailsDialogOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog
        open={revokeDialogOpen}
        onClose={() => {
          setRevokeDialogOpen(false);
          setRevokeReason('');
        }}
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #1F2937',
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>إلغاء الجائزة</DialogTitle>
        <DialogContent>
          <TextField
            label="سبب الإلغاء"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#020617',
                '& fieldset': { borderColor: '#1F2937' },
              },
              textarea: { color: '#E5E7EB' },
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeDialogOpen(false)}>إلغاء</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRevoke}
            disabled={revokeMutation.isPending}
          >
            تأكيد الإلغاء
          </Button>
        </DialogActions>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog
        open={extendDialogOpen}
        onClose={() => {
          setExtendDialogOpen(false);
          setExtendDays(30);
        }}
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #1F2937',
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>تمديد صلاحية الجائزة</DialogTitle>
        <DialogContent>
          <TextField
            label="عدد الأيام"
            type="number"
            value={extendDays}
            onChange={(e) => setExtendDays(Number(e.target.value))}
            fullWidth
            required
            inputProps={{ min: 1 }}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#020617',
                '& fieldset': { borderColor: '#1F2937' },
              },
              input: { color: '#E5E7EB' },
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendDialogOpen(false)}>إلغاء</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExtend}
            disabled={extendMutation.isPending}
          >
            تأكيد التمديد
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RewardsHistoryPage;

