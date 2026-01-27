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
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetRestaurants,
  mockCreateRestaurant,
  Restaurant,
} from '../../services/api/restaurants';

const RestaurantsListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', statusFilter, searchQuery, page, limit],
    queryFn: () =>
      mockGetRestaurants({
        status: statusFilter,
        search: searchQuery,
        page,
        limit,
      }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      mockCreateRestaurant({
        name,
        ownerName,
        ownerEmail,
        phone,
        cuisineType,
        address: address || undefined,
        description: description || undefined,
        status: 'pending',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      showSnackbar('تم إنشاء المطعم بنجاح', 'success');
      setDialogOpen(false);
      setName('');
      setOwnerName('');
      setOwnerEmail('');
      setPhone('');
      setCuisineType('');
      setAddress('');
      setDescription('');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء إنشاء المطعم', 'error');
    },
  });

  const columns = useMemo<ColumnDef<Restaurant>[]>(
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
        header: 'اسم المطعم',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontWeight: 500 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'ownerEmail',
        header: 'البريد الإلكتروني',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'cuisineType',
        header: 'نوع المطبخ',
        cell: (info) => (
          <Chip
            label={String(info.getValue())}
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
        accessorKey: 'status',
        header: 'الحالة',
        cell: (info) => {
          const status = String(info.getValue());
          const labels: Record<string, { label: string; color: string }> = {
            approved: { label: 'موافق عليه', color: '#22C55E' },
            pending: { label: 'قيد المراجعة', color: '#F59E0B' },
            suspended: { label: 'معطل', color: '#EF4444' },
          };
          const config = labels[status] || { label: status, color: '#9CA3AF' };
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
        accessorKey: 'totalRevenue',
        header: 'إجمالي الإيرادات',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())} ر.س
          </Typography>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'التقييم',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            ⭐ {String(info.getValue())}
          </Typography>
        ),
      },
    ],
    []
  );

  const handleView = (restaurant: Restaurant) => {
    navigate(`/restaurants/${restaurant.id}`);
  };

  const handleEdit = (restaurant: Restaurant) => {
    navigate(`/restaurants/${restaurant.id}/edit`);
  };

  const handleDelete = (restaurant: Restaurant) => {
    if (window.confirm(`هل أنت متأكد من حذف المطعم "${restaurant.name}"؟`)) {
      // Handle delete
      showSnackbar('تم حذف المطعم', 'success');
    }
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
            إدارة المطاعم
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            عرض وإدارة جميع المطاعم في النظام
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 1.5 },
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate('/restaurants/pending')}
            sx={{
              borderColor: '#F59E0B',
              color: '#F59E0B',
              width: { xs: '100%', sm: 'auto' },
            }}
            size="small"
          >
            المطاعم المعلقة ({data?.pagination.total || 0})
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            size="small"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            إضافة مطعم
          </Button>
        </Box>
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
            <MenuItem value="approved">موافق عليه</MenuItem>
            <MenuItem value="pending">قيد المراجعة</MenuItem>
            <MenuItem value="suspended">معطل</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="ابحث عن مطعم..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6B7280', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#020617',
              '& fieldset': { borderColor: '#1F2937' },
              '&:hover fieldset': { borderColor: '#374151' },
            },
            input: { color: '#E5E7EB' },
          }}
        />
      </Box>

      {/* Table */}
      {isLoading ? (
        <SkeletonLoader variant="table" count={5} />
      ) : !data || data.restaurants.length === 0 ? (
        <EmptyState
          title="لا يوجد مطاعم"
          description="لم يتم العثور على أي مطاعم لعرضها."
        />
      ) : (
        <>
          <DataTable
            data={data.restaurants}
            columns={columns}
            searchable={false}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {/* Custom Pagination */}
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              إجمالي النتائج: {data.pagination.total} | الصفحة {data.pagination.page} من{' '}
              {data.pagination.totalPages}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                السابق
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                التالي
              </Button>
            </Box>
          </Box>
        </>
      )}

      {/* Add Restaurant Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setName('');
          setOwnerName('');
          setOwnerEmail('');
          setPhone('');
          setCuisineType('');
          setAddress('');
          setDescription('');
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #1F2937',
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' },
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>إضافة مطعم جديد</DialogTitle>
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
                label="اسم المطعم"
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
                label="اسم صاحب المطعم"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
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
                label="بريد صاحب المطعم"
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
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
              <TextField
                label="نوع المطبخ"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
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
                label="العنوان (اختياري)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                label="الوصف (اختياري)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                size="small"
                fullWidth
                multiline
                minRows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#020617',
                    '& fieldset': { borderColor: '#1F2937' },
                    '&:hover fieldset': { borderColor: '#374151' },
                  },
                  textarea: { color: '#E5E7EB' },
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #1F2937' }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setName('');
              setOwnerName('');
              setOwnerEmail('');
              setPhone('');
              setCuisineType('');
              setAddress('');
              setDescription('');
            }}
            sx={{ color: '#9CA3AF' }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate()}
            disabled={
              !name ||
              !ownerName ||
              !ownerEmail ||
              !phone ||
              !cuisineType ||
              createMutation.isPending
            }
          >
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantsListPage;

