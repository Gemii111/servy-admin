import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetUsers,
  mockUpdateUserStatus,
  mockDeleteUser,
  mockCreateUser,
  User,
} from '../../services/api/users';

const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'customer' | 'driver' | 'restaurant'>('customer');

  const { data, isLoading } = useQuery({
    queryKey: ['users', userTypeFilter, statusFilter, searchQuery, page, limit],
    queryFn: () =>
      mockGetUsers({
        userType: userTypeFilter,
        status: statusFilter,
        search: searchQuery,
        page,
        limit,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      mockUpdateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar('تم تحديث حالة المستخدم بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء تحديث حالة المستخدم', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar('تم حذف المستخدم بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء حذف المستخدم', 'error');
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      mockCreateUser({
        name,
        email,
        phone,
        userType,
        status: 'active',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar('تم إنشاء المستخدم بنجاح', 'success');
      setDialogOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setUserType('customer');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء إنشاء المستخدم', 'error');
    },
  });

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => (
          <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
            {String(info.getValue()).slice(0, 8)}...
          </Typography>
        ),
      },
      {
        accessorKey: 'name',
        header: 'الاسم',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontWeight: 500 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'email',
        header: 'البريد الإلكتروني',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'الهاتف',
        cell: (info) => (
          <Typography sx={{ color: '#9CA3AF', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'userType',
        header: 'النوع',
        cell: (info) => {
          const type = String(info.getValue());
          const labels: Record<string, { label: string; color: string }> = {
            customer: { label: 'عميل', color: '#2563EB' },
            driver: { label: 'سائق', color: '#22C55E' },
            restaurant: { label: 'مطعم', color: '#F59E0B' },
          };
          const config = labels[type] || { label: type, color: '#9CA3AF' };
          return (
            <Chip
              label={config.label}
              size="small"
              sx={{
                bgcolor: `${config.color}20`,
                color: config.color,
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'totalOrders',
        header: 'عدد الطلبات',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'totalSpent',
        header: 'إجمالي الإنفاق',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())} ر.س
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: (info) => {
          const status = String(info.getValue());
          return (
            <Chip
              label={status === 'active' ? 'نشط' : 'معطل'}
              size="small"
              sx={{
                bgcolor: status === 'active' ? '#22C55E20' : '#EF444420',
                color: status === 'active' ? '#22C55E' : '#EF4444',
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          );
        },
      },
    ],
    []
  );

  const handleView = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handleEdit = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    updateStatusMutation.mutate({ id: user.id, status: newStatus });
  };

  return (
    <Box sx={{ color: '#E5E7EB' }}>
      {/* Header */}
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
          <Typography
            variant="h5"
            fontWeight={700}
            mb={0.5}
            sx={{ fontSize: { xs: 20, sm: 24 } }}
          >
            إدارة المستخدمين
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            عرض وإدارة جميع المستخدمين في النظام
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          size="small"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          إضافة مستخدم
        </Button>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>نوع المستخدم</InputLabel>
          <Select
            value={userTypeFilter}
            onChange={(e) => {
              setUserTypeFilter(e.target.value);
              setPage(1);
            }}
            label="نوع المستخدم"
            sx={{
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
              '& .MuiSvgIcon-root': { color: '#9CA3AF' },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="customer">عملاء</MenuItem>
            <MenuItem value="driver">سائقون</MenuItem>
            <MenuItem value="restaurant">مطاعم</MenuItem>
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
            label="الحالة"
            sx={{
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
              '& .MuiSvgIcon-root': { color: '#9CA3AF' },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="active">نشط</MenuItem>
            <MenuItem value="suspended">معطل</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      {isLoading ? (
        <SkeletonLoader variant="table" count={5} />
      ) : !data || data.users.length === 0 ? (
        <EmptyState
          title="لا يوجد مستخدمون"
          description="لم يتم العثور على أي مستخدمين لعرضهم."
        />
      ) : (
        <DataTable
          data={data.users}
          columns={columns}
          searchable={true}
          searchPlaceholder="ابحث عن مستخدم..."
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add User Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setName('');
          setEmail('');
          setPhone('');
          setUserType('customer');
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #1F2937',
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' },
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>إضافة مستخدم جديد</DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2,
              mt: 0.5,
            }}
          >
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                label="الاسم الكامل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#020617',
                    '& fieldset': { borderColor: '#1F2937' },
                    '&:hover fieldset': { borderColor: '#374151' },
                  },
                  input: { color: '#E5E7EB' },
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                }}
              />
            </Box>
            <Box>
              <TextField
                label="البريد الإلكتروني"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#020617',
                    '& fieldset': { borderColor: '#1F2937' },
                    '&:hover fieldset': { borderColor: '#374151' },
                  },
                  input: { color: '#E5E7EB' },
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                }}
              />
            </Box>
            <Box>
              <TextField
                label="رقم الهاتف"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#020617',
                    '& fieldset': { borderColor: '#1F2937' },
                    '&:hover fieldset': { borderColor: '#374151' },
                  },
                  input: { color: '#E5E7EB' },
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                }}
              />
            </Box>
            <Box>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: '#9CA3AF' }}>نوع المستخدم</InputLabel>
                <Select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as 'customer' | 'driver' | 'restaurant')}
                  label="نوع المستخدم"
                  sx={{
                    color: '#E5E7EB',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
                    '& .MuiSvgIcon-root': { color: '#9CA3AF' },
                    bgcolor: '#020617',
                  }}
                >
                  <MenuItem value="customer">عميل</MenuItem>
                  <MenuItem value="driver">سائق</MenuItem>
                  <MenuItem value="restaurant">مطعم</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #1F2937' }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setName('');
              setEmail('');
              setPhone('');
              setUserType('customer');
            }}
            sx={{ color: '#9CA3AF' }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate()}
            disabled={!name || !email || !phone || createMutation.isPending}
          >
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersListPage;

