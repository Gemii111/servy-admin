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
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SendIcon from '@mui/icons-material/Send';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetRewards,
  mockCreateReward,
  mockUpdateReward,
  mockDeleteReward,
  mockAssignReward,
  mockAssignRewardByCriteria,
  Reward,
  RewardType,
  RewardCriteriaType,
} from '../../services/api/rewards';
import { mockGetUsers } from '../../services/api/users';

const RewardsListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rewardType, setRewardType] = useState<RewardType>('cash_credit');
  const [rewardValue, setRewardValue] = useState('');
  const [expiryDays, setExpiryDays] = useState('');
  const [usageLimit, setUsageLimit] = useState('1');
  
  // Assign reward states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [assignMode, setAssignMode] = useState<'specific' | 'all' | 'customers' | 'drivers' | 'restaurants'>('specific');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [sendNotification, setSendNotification] = useState(true);
  const [assignNotes, setAssignNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['rewards', typeFilter],
    queryFn: () =>
      mockGetRewards({
        rewardType: typeFilter as RewardType | 'all',
        isActive: true,
      }),
  });

  const createMutation = useMutation({
    mutationFn: mockCreateReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSnackbar('تم إنشاء الجائزة بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء إنشاء الجائزة', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reward> }) =>
      mockUpdateReward(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSnackbar('تم تحديث الجائزة بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء تحديث الجائزة', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: mockDeleteReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSnackbar('تم حذف الجائزة بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء حذف الجائزة', 'error');
    },
  });

  // Fetch users for assign dialog
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'assign', userTypeFilter, userSearchQuery],
    queryFn: () =>
      mockGetUsers({
        userType: userTypeFilter !== 'all' ? userTypeFilter : undefined,
        search: userSearchQuery || undefined,
        limit: 100,
      }),
    enabled: assignDialogOpen,
  });

  const assignMutation = useMutation({
    mutationFn: (data: {
      rewardId: string;
      userIds?: string[];
      criteria?: {
        type: RewardCriteriaType;
        value?: number;
        minOrders?: number;
        minSpent?: number;
      };
      sendNotification?: boolean;
      notes?: string;
    }) => {
      if (data.userIds) {
        return mockAssignReward({
          rewardId: data.rewardId,
          userIds: data.userIds,
          sendNotification: data.sendNotification,
          notes: data.notes,
        });
      } else {
        return mockAssignRewardByCriteria({
          rewardId: data.rewardId,
          criteria: data.criteria!,
          sendNotification: data.sendNotification,
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      showSnackbar(`تم منح الجائزة لـ ${data.assignedCount} مستخدم بنجاح`, 'success');
      setAssignDialogOpen(false);
      setSelectedReward(null);
      setAssignMode('specific');
      setSelectedUsers([]);
      setUserSearchQuery('');
      setUserTypeFilter('all');
      setSendNotification(true);
      setAssignNotes('');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء منح الجائزة', 'error');
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setRewardType('cash_credit');
    setRewardValue('');
    setExpiryDays('');
    setUsageLimit('1');
    setEditingReward(null);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setName(reward.name);
    setDescription(reward.description || '');
    setRewardType(reward.rewardType);
    setRewardValue(reward.rewardValue.toString());
    setExpiryDays(reward.expiryDays?.toString() || '');
    setUsageLimit(reward.usageLimit.toString());
    setDialogOpen(true);
  };

  const handleDelete = (reward: Reward) => {
    if (window.confirm(`هل أنت متأكد من حذف الجائزة "${reward.name}"؟`)) {
      deleteMutation.mutate(reward.id);
    }
  };

  const handleAssign = (reward: Reward) => {
    setSelectedReward(reward);
    setAssignMode('specific');
    setSelectedUsers([]);
    setUserSearchQuery('');
    setUserTypeFilter('all');
    setSendNotification(true);
    setAssignNotes('');
    setAssignDialogOpen(true);
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (usersData?.users) {
      if (selectedUsers.length === usersData.users.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers(usersData.users.map((u) => u.id));
      }
    }
  };

  const handleAssignSubmit = () => {
    if (!selectedReward) return;

    if (assignMode === 'specific' && selectedUsers.length === 0) {
      showSnackbar('الرجاء اختيار مستخدم واحد على الأقل', 'warning');
      return;
    }

    if (assignMode === 'specific') {
      assignMutation.mutate({
        rewardId: selectedReward.id,
        userIds: selectedUsers,
        sendNotification,
        notes: assignNotes.trim() || undefined,
      });
    } else {
      // Assign by criteria
      let criteriaType: RewardCriteriaType = 'all_users';
      
      if (assignMode === 'all') {
        criteriaType = 'all_users';
      } else if (assignMode === 'customers') {
        criteriaType = 'all_customers';
      } else if (assignMode === 'drivers') {
        criteriaType = 'all_drivers';
      } else if (assignMode === 'restaurants') {
        criteriaType = 'all_restaurants';
      }

      assignMutation.mutate({
        rewardId: selectedReward.id,
        criteria: {
          type: criteriaType,
        },
        sendNotification,
        notes: assignNotes.trim() || undefined,
      });
    }
  };

  const handleDialogSave = () => {
    if (!name.trim() || !rewardValue.trim()) {
      showSnackbar('الرجاء إدخال اسم الجائزة والقيمة', 'warning');
      return;
    }

    const data = {
      name,
      description: description.trim() || undefined,
      rewardType,
      rewardValue: parseFloat(rewardValue),
      expiryDays: expiryDays ? parseInt(expiryDays) : undefined,
      usageLimit: parseInt(usageLimit),
    };

    if (editingReward) {
      updateMutation.mutate({ id: editingReward.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getRewardTypeLabel = (type: RewardType) => {
    const labels: Record<RewardType, string> = {
      discount_coupon: 'كوبون خصم',
      free_delivery: 'توصيل مجاني',
      cash_credit: 'رصيد نقدي',
      free_item: 'عنصر مجاني',
      points: 'نقاط',
      custom: 'مخصص',
    };
    return labels[type] || type;
  };

  const columns = useMemo<ColumnDef<Reward>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'اسم الجائزة',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'rewardType',
        header: 'نوع الجائزة',
        cell: (info) => (
          <Chip
            label={getRewardTypeLabel(info.getValue() as RewardType)}
            size="small"
            sx={{
              bgcolor: '#2563EB20',
              color: '#2563EB',
              fontWeight: 500,
              fontSize: 12,
            }}
          />
        ),
      },
      {
        accessorKey: 'rewardValue',
        header: 'القيمة',
        cell: (info) => {
          const value = info.getValue() as number;
          const type = (info.row.original as Reward).rewardType;
          return (
            <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
              {type === 'discount_coupon' ? `${value}%` : `${value} ر.س`}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'expiryDays',
        header: 'مدة الصلاحية',
        cell: (info) => {
          const value = info.getValue();
          return (
            <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
              {value ? `${value} يوم` : 'غير محدد'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'usageLimit',
        header: 'حد الاستخدام',
        cell: (info) => (
          <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
            {String(info.getValue())} مرة
          </Typography>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'الحالة',
        cell: (info) => {
          const isActive = info.getValue() as boolean;
          return (
            <Chip
              label={isActive ? 'نشط' : 'معطل'}
              size="small"
              sx={{
                bgcolor: isActive ? '#22C55E20' : '#EF444420',
                color: isActive ? '#22C55E' : '#EF4444',
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: (info) => {
          const reward = info.row.original as Reward;
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SendIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssign(reward);
                }}
                sx={{
                  borderColor: '#22C55E',
                  color: '#22C55E',
                  fontSize: 12,
                  '&:hover': {
                    borderColor: '#16A34A',
                    bgcolor: '#22C55E10',
                  },
                }}
              >
                منح
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
            إدارة الجوائز
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            إنشاء وإدارة الجوائز والهدايا للمستخدمين
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate('/rewards/statistics')}
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            size="small"
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            إضافة جائزة
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>نوع الجائزة</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{
              bgcolor: '#020617',
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
            }}
            label="نوع الجائزة"
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
      </Box>

      {data && data.rewards.length > 0 ? (
        <DataTable
          data={data.rewards}
          columns={columns}
          isLoading={isLoading}
          searchable={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <EmptyState
          title="لا توجد جوائز"
          description="لم يتم العثور على أي جوائز."
          icon={<CardGiftcardIcon />}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #1F2937',
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>
          {editingReward ? 'تعديل الجائزة' : 'إضافة جائزة جديدة'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <TextField
              label="اسم الجائزة"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                },
                input: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
              }}
            />

            <TextField
              label="الوصف"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                },
                textarea: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#9CA3AF' }}>نوع الجائزة</InputLabel>
              <Select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value as RewardType)}
                sx={{
                  bgcolor: '#020617',
                  color: '#E5E7EB',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                }}
              >
                <MenuItem value="discount_coupon">كوبون خصم</MenuItem>
                <MenuItem value="free_delivery">توصيل مجاني</MenuItem>
                <MenuItem value="cash_credit">رصيد نقدي</MenuItem>
                <MenuItem value="free_item">عنصر مجاني</MenuItem>
                <MenuItem value="points">نقاط</MenuItem>
                <MenuItem value="custom">مخصص</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="قيمة الجائزة"
              type="number"
              value={rewardValue}
              onChange={(e) => setRewardValue(e.target.value)}
              fullWidth
              required
              helperText={
                rewardType === 'discount_coupon'
                  ? 'النسبة المئوية للخصم'
                  : 'المبلغ بالريال السعودي'
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                },
                input: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
                '& .MuiFormHelperText-root': { color: '#6B7280' },
              }}
            />

            <TextField
              label="مدة الصلاحية (بالأيام)"
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              fullWidth
              helperText="اتركه فارغاً إذا لم يكن هناك تاريخ انتهاء"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                },
                input: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
                '& .MuiFormHelperText-root': { color: '#6B7280' },
              }}
            />

            <TextField
              label="حد الاستخدام"
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                },
                input: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDialogSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingReward ? 'تحديث' : 'إنشاء'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Reward Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => {
      setAssignDialogOpen(false);
      setSelectedReward(null);
      setAssignMode('specific');
      setSelectedUsers([]);
      setUserSearchQuery('');
      setUserTypeFilter('all');
      setSendNotification(true);
      setAssignNotes('');
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
        <DialogTitle sx={{ color: '#E5E7EB' }}>
          منح الجائزة: {selectedReward?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ color: '#9CA3AF', mb: 1 }}>طريقة المنح</FormLabel>
              <RadioGroup
                value={assignMode}
                onChange={(e) => {
                  setAssignMode(e.target.value as typeof assignMode);
                  if (e.target.value !== 'specific') {
                    setSelectedUsers([]);
                  }
                }}
                sx={{ color: '#E5E7EB' }}
              >
                <FormControlLabel value="specific" control={<Radio />} label="مستخدمون محددون" />
                <FormControlLabel value="all" control={<Radio />} label="جميع المستخدمين" />
                <FormControlLabel value="customers" control={<Radio />} label="جميع العملاء" />
                <FormControlLabel value="drivers" control={<Radio />} label="جميع السائقين" />
                <FormControlLabel value="restaurants" control={<Radio />} label="جميع المطاعم" />
              </RadioGroup>
            </FormControl>

            {assignMode === 'specific' && (
              <>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    placeholder="ابحث عن مستخدم..."
                    size="small"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#020617',
                        '& fieldset': { borderColor: '#1F2937' },
                        '&:hover fieldset': { borderColor: '#374151' },
                      },
                      input: { color: '#E5E7EB' },
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ color: '#9CA3AF' }}>النوع</InputLabel>
                    <Select
                      value={userTypeFilter}
                      onChange={(e) => setUserTypeFilter(e.target.value)}
                      sx={{
                        bgcolor: '#020617',
                        color: '#E5E7EB',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                      }}
                      label="النوع"
                    >
                      <MenuItem value="all">الكل</MenuItem>
                      <MenuItem value="customer">عملاء</MenuItem>
                      <MenuItem value="driver">سائقون</MenuItem>
                      <MenuItem value="restaurant">مطاعم</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1,
                borderBottom: '1px solid #1F2937',
              }}
            >
              <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
                تم اختيار {selectedUsers.length} مستخدم
              </Typography>
              <Button size="small" onClick={handleSelectAll}>
                {usersData?.users &&
                selectedUsers.length === usersData.users.length
                  ? 'إلغاء اختيار الكل'
                  : 'اختيار الكل'}
              </Button>
            </Box>

            {usersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <List
                sx={{
                  maxHeight: 300,
                  overflowY: 'auto',
                  bgcolor: '#020617',
                  borderRadius: 1,
                  border: '1px solid #1F2937',
                }}
              >
                {usersData?.users && usersData.users.length > 0 ? (
                  usersData.users.map((user) => (
                    <ListItem key={user.id} disablePadding>
                      <ListItemButton
                        onClick={() => handleToggleUser(user.id)}
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(37,99,235,0.1)',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            edge="start"
                            sx={{
                              color: '#2563EB',
                              '&.Mui-checked': {
                                color: '#2563EB',
                              },
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
                              {user.name}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
                              {user.email} •{' '}
                              {user.userType === 'customer'
                                ? 'عميل'
                                : user.userType === 'driver'
                                ? 'سائق'
                                : 'مطعم'}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: '#9CA3AF' }}>لا توجد نتائج</Typography>
                  </Box>
                )}
              </List>
            )}
            </>
            )}

            {assignMode !== 'specific' && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#020617',
                  borderRadius: 1,
                  border: '1px solid #1F2937',
                }}
              >
                <Typography sx={{ color: '#E5E7EB', fontSize: 14, fontWeight: 500, mb: 0.5 }}>
                  سيتم منح الجائزة لـ:
                </Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
                  {assignMode === 'all' && 'جميع المستخدمين في النظام'}
                  {assignMode === 'customers' && 'جميع العملاء المسجلين'}
                  {assignMode === 'drivers' && 'جميع السائقين المسجلين'}
                  {assignMode === 'restaurants' && 'جميع المطاعم المسجلة'}
                </Typography>
              </Box>
            )}

            {selectedUsers.length > 0 && assignMode === 'specific' && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  p: 1.5,
                  bgcolor: '#020617',
                  borderRadius: 1,
                  border: '1px solid #1F2937',
                  maxHeight: 120,
                  overflowY: 'auto',
                }}
              >
                {usersData?.users
                  .filter((u) => selectedUsers.includes(u.id))
                  .map((user) => (
                    <Chip
                      key={user.id}
                      label={`${user.name} (${user.userType === 'customer' ? 'عميل' : user.userType === 'driver' ? 'سائق' : 'مطعم'})`}
                      onDelete={() => handleToggleUser(user.id)}
                      size="small"
                      sx={{
                        bgcolor: '#2563EB20',
                        color: '#2563EB',
                        '& .MuiChip-deleteIcon': {
                          color: '#2563EB',
                        },
                      }}
                    />
                  ))}
              </Box>
            )}

            <TextField
              label="ملاحظات (اختياري)"
              value={assignNotes}
              onChange={(e) => setAssignNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                },
                textarea: { color: '#E5E7EB' },
                '& .MuiInputLabel-root': { color: '#9CA3AF' },
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                sx={{
                  color: '#2563EB',
                  '&.Mui-checked': {
                    color: '#2563EB',
                  },
                }}
              />
              <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
                إرسال إشعار للمستخدمين عند منح الجائزة
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAssignDialogOpen(false);
              setSelectedReward(null);
              setSelectedUsers([]);
            }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssignSubmit}
            disabled={assignMutation.isPending || (assignMode === 'specific' && selectedUsers.length === 0)}
            startIcon={<SendIcon />}
          >
            {assignMode === 'specific'
              ? `منح الجائزة (${selectedUsers.length})`
              : assignMode === 'all'
              ? 'منح الجائزة للجميع'
              : assignMode === 'customers'
              ? 'منح الجائزة لجميع العملاء'
              : assignMode === 'drivers'
              ? 'منح الجائزة لجميع السائقين'
              : 'منح الجائزة لجميع المطاعم'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RewardsListPage;

