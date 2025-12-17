import React, { useMemo, useState } from 'react';
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
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetCategories,
  mockCreateCategory,
  mockUpdateCategory,
  mockDeleteCategory,
  mockToggleCategoryStatus,
  Category,
} from '../../services/api/categories';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const CategoriesListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['categories', statusFilter, searchQuery, page, limit],
    queryFn: () =>
      mockGetCategories({
        status: statusFilter,
        search: searchQuery,
        page,
        limit,
      }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      mockCreateCategory({
        name,
        slug,
        description: description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSnackbar('تم إنشاء الفئة بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء إنشاء الفئة', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      editingCategory
        ? mockUpdateCategory(editingCategory.id, {
            name,
            slug,
            description: description || undefined,
          })
        : Promise.reject(new Error('No category selected')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSnackbar('تم تحديث الفئة بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء تحديث الفئة', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (category: Category) => mockDeleteCategory(category.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSnackbar('تم حذف الفئة', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء حذف الفئة', 'error');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (category: Category) => mockToggleCategoryStatus(category.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSnackbar('تم تحديث حالة الفئة', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء تحديث حالة الفئة', 'error');
    },
  });

  const resetForm = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || '');
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (!name.trim() || !slug.trim()) {
      showSnackbar('الرجاء إدخال اسم الفئة والـ slug', 'warning');
      return;
    }

    if (editingCategory) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleDelete = (category: Category) => {
    if (window.confirm(`هل أنت متأكد من حذف الفئة "${category.name}"؟`)) {
      deleteMutation.mutate(category);
    }
  };

  const handleToggleStatus = (category: Category) => {
    toggleStatusMutation.mutate(category);
  };

  const columns = useMemo<ColumnDef<Category>[]>(() => {
    return [
      {
        accessorKey: 'name',
        header: 'اسم الفئة',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontWeight: 500 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: (info) => (
          <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'الحالة',
        cell: (info) => {
          const value = info.getValue() as boolean;
          const color = value ? '#22C55E' : '#EF4444';
          const label = value ? 'نشطة' : 'معطلة';
          return (
            <Chip
              label={label}
              size="small"
              sx={{
                bgcolor: `${color}20`,
                color,
                fontWeight: 500,
                fontSize: 12,
                cursor: 'pointer',
              }}
              onClick={() => handleToggleStatus(info.row.original as Category)}
            />
          );
        },
      },
      {
        accessorKey: 'sortOrder',
        header: 'الترتيب',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'تاريخ الإنشاء',
        cell: (info) => (
          <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
            {format(new Date(String(info.getValue())), 'dd MMM yyyy', { locale: ar })}
          </Typography>
        ),
      },
    ];
  }, []);

  const categories = data?.categories ?? [];

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
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            إدارة الفئات
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            تنظيم وإدارة فئات قائمة الطعام
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          إضافة فئة
        </Button>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          mb: 2,
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
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
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
            <MenuItem value="active">نشطة</MenuItem>
            <MenuItem value="inactive">معطلة</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="ابحث عن فئة..."
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
      ) : categories.length === 0 ? (
        <EmptyState
          title="لا توجد فئات"
          description="لم يتم العثور على أي فئات لعرضها."
        />
      ) : (
        <>
          <DataTable
            data={categories}
            columns={columns}
            searchable={false}
            onEdit={(row) => openEditDialog(row as Category)}
            onDelete={(row) => handleDelete(row as Category)}
            onView={(row) => openEditDialog(row as Category)}
          />

          {/* Custom Pagination + Quick Actions Legend */}
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
              إجمالي النتائج: {data?.pagination.total ?? categories.length} | الصفحة{' '}
              {data?.pagination.page ?? 1} من {data?.pagination.totalPages ?? 1}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                السابق
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={data ? page >= data.pagination.totalPages : true}
                onClick={() =>
                  setPage((prev) =>
                    data ? Math.min(prev + 1, data.pagination.totalPages) : prev
                  )
                }
              >
                التالي
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                <ToggleOnIcon sx={{ color: '#22C55E', fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  اضغط على حالة الفئة للتفعيل / التعطيل
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            minWidth: 420,
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>
          {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="اسم الفئة"
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
                '& .MuiInputBase-input': {
                  color: '#E5E7EB',
                },
                '& .MuiInputLabel-root': {
                  color: '#9CA3AF',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2563EB',
                },
              }}
            />
            <TextField
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                  '&:hover fieldset': { borderColor: '#374151' },
                },
                '& .MuiInputBase-input': {
                  color: '#E5E7EB',
                },
                '& .MuiInputLabel-root': {
                  color: '#9CA3AF',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2563EB',
                },
              }}
            />
            <TextField
              label="الوصف (اختياري)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="small"
              fullWidth
              multiline
              minRows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#020617',
                  '& fieldset': { borderColor: '#1F2937' },
                  '&:hover fieldset': { borderColor: '#374151' },
                },
                '& .MuiInputBase-input': {
                  color: '#E5E7EB',
                },
                '& .MuiInputLabel-root': {
                  color: '#9CA3AF',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2563EB',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #1F2937' }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}
            sx={{ color: '#9CA3AF' }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            startIcon={editingCategory ? <EditIcon /> : <AddIcon />}
            onClick={handleDialogSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingCategory ? 'حفظ التعديلات' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesListPage;


