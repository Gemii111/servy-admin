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
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetCoupons,
  mockCreateCoupon,
  mockUpdateCoupon,
  mockDeleteCoupon,
  mockToggleCouponStatus,
  Coupon,
  CouponStatus,
  CouponType,
} from '../../services/api/coupons';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const CouponsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [statusFilter, setStatusFilter] = useState<CouponStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CouponType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CouponType>('percentage');
  const [value, setValue] = useState<number | ''>('');
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<CouponStatus>('active');

  const { data, isLoading } = useQuery({
    queryKey: ['coupons', statusFilter, typeFilter, searchQuery, page, limit],
    queryFn: () =>
      mockGetCoupons({
        status: statusFilter,
        type: typeFilter,
        search: searchQuery,
        page,
        limit,
      }),
  });

  const resetForm = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setType('percentage');
    setValue('');
    setMaxDiscount('');
    setMinOrderAmount('');
    setUsageLimit('');
    setStartDate('');
    setEndDate('');
    setStatus('active');
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDescription(coupon.description || '');
    setType(coupon.type);
    setValue(coupon.value);
    setMaxDiscount(coupon.maxDiscount ?? '');
    setMinOrderAmount(coupon.minOrderAmount ?? '');
    setUsageLimit(coupon.usageLimit ?? '');
    setStartDate(coupon.startDate.slice(0, 10));
    setEndDate(coupon.endDate ? coupon.endDate.slice(0, 10) : '');
    setStatus(coupon.status);
    setDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      mockCreateCoupon({
        code,
        description: description || undefined,
        type,
        value: Number(value),
        maxDiscount: type === 'percentage' && maxDiscount !== '' ? Number(maxDiscount) : undefined,
        minOrderAmount: minOrderAmount !== '' ? Number(minOrderAmount) : undefined,
        usageLimit: usageLimit !== '' ? Number(usageLimit) : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showSnackbar('تم إنشاء الكوبون بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء إنشاء الكوبون', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      editingCoupon
        ? mockUpdateCoupon(editingCoupon.id, {
            code,
            description: description || undefined,
            type,
            value: Number(value),
            maxDiscount: type === 'percentage' && maxDiscount !== '' ? Number(maxDiscount) : undefined,
            minOrderAmount: minOrderAmount !== '' ? Number(minOrderAmount) : undefined,
            usageLimit: usageLimit !== '' ? Number(usageLimit) : undefined,
            startDate: new Date(startDate).toISOString(),
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            status,
          })
        : Promise.reject(new Error('No coupon selected')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showSnackbar('تم تحديث الكوبون بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء تحديث الكوبون', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (coupon: Coupon) => mockDeleteCoupon(coupon.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showSnackbar('تم حذف الكوبون', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء حذف الكوبون', 'error');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (coupon: Coupon) => mockToggleCouponStatus(coupon.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      showSnackbar('تم تحديث حالة الكوبون', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء تحديث حالة الكوبون', 'error');
    },
  });

  const handleDialogSave = () => {
    if (!code.trim() || value === '' || !startDate) {
      showSnackbar('الرجاء إدخال الكود والقيمة وتاريخ البداية', 'warning');
      return;
    }

    if (editingCoupon) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleDelete = (coupon: Coupon) => {
    if (window.confirm(`هل أنت متأكد من حذف الكوبون "${coupon.code}"؟`)) {
      deleteMutation.mutate(coupon);
    }
  };

  const getStatusConfig = (status: CouponStatus) => {
    const map: Record<CouponStatus, { label: string; color: string }> = {
      active: { label: 'نشط', color: '#22C55E' },
      scheduled: { label: 'مجدول', color: '#38BDF8' },
      expired: { label: 'منتهي', color: '#9CA3AF' },
      disabled: { label: 'معطل', color: '#EF4444' },
    };
    return map[status];
  };

  const coupons = data?.coupons ?? [];

  const columns = useMemo<ColumnDef<Coupon>[]>(() => {
    const handleToggleStatus = (coupon: Coupon) => {
      toggleStatusMutation.mutate(coupon);
    };

    return [
      {
        accessorKey: 'code',
        header: 'كود الكوبون',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontWeight: 600, fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'type',
        header: 'النوع',
        cell: (info) => {
          const typeValue = info.getValue() as CouponType;
          const label = typeValue === 'percentage' ? 'نسبة مئوية' : 'قيمة ثابتة';
          return (
            <Chip
              label={label}
              size="small"
              sx={{
                bgcolor: typeValue === 'percentage' ? '#2563EB20' : '#F9731620',
                color: typeValue === 'percentage' ? '#2563EB' : '#F97316',
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'value',
        header: 'قيمة الخصم',
        cell: (info) => {
          const row = info.row.original as Coupon;
          if (row.type === 'percentage') {
            return (
              <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
                {row.value}% {row.maxDiscount ? `(بحد أقصى ${row.maxDiscount} ر.س)` : ''}
              </Typography>
            );
          }
          return (
            <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
              {row.value} ر.س
            </Typography>
          );
        },
      },
      {
        accessorKey: 'minOrderAmount',
        header: 'أقل قيمة طلب',
        cell: (info) => {
          const value = info.getValue() as number | null;
          return (
            <Typography sx={{ color: value ? '#E5E7EB' : '#9CA3AF', fontSize: 13 }}>
              {value ? `${value} ر.س` : 'بدون حد أدنى'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'usageLimit',
        header: 'عدد الاستخدامات',
        cell: (info) => {
          const row = info.row.original as Coupon;
          return (
            <Typography sx={{ color: '#E5E7EB', fontSize: 13 }}>
              {row.usedCount}
              {row.usageLimit ? ` / ${row.usageLimit}` : ' (غير محدود)'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: (info) => {
          const statusValue = info.getValue() as CouponStatus;
          const config = getStatusConfig(statusValue);
          return (
            <Chip
              label={config.label}
              size="small"
              sx={{
                bgcolor: `${config.color}20`,
                color: config.color,
                fontWeight: 500,
                fontSize: 12,
                cursor: statusValue === 'expired' ? 'default' : 'pointer',
              }}
              onClick={
                statusValue === 'expired'
                  ? undefined
                  : () => handleToggleStatus(info.row.original as Coupon)
              }
            />
          );
        },
      },
      {
        accessorKey: 'startDate',
        header: 'تاريخ البداية',
        cell: (info) => (
          <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
            {format(new Date(String(info.getValue())), 'dd MMM yyyy', { locale: ar })}
          </Typography>
        ),
      },
      {
        accessorKey: 'endDate',
        header: 'تاريخ الانتهاء',
        cell: (info) => {
          const value = info.getValue() as string | undefined;
          return (
            <Typography sx={{ color: value ? '#9CA3AF' : '#9CA3AF80', fontSize: 13 }}>
              {value
                ? format(new Date(String(value)), 'dd MMM yyyy', { locale: ar })
                : 'بدون انتهاء'}
            </Typography>
          );
        },
      },
    ];
  }, [toggleStatusMutation]);

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
            إدارة الكوبونات
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            إنشاء وإدارة أكواد الخصم في النظام
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          إضافة كوبون
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
          <InputLabel sx={{ color: '#9CA3AF' }}>حالة الكوبون</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as CouponStatus | 'all');
              setPage(1);
            }}
            label="حالة الكوبون"
            sx={{
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
              '& .MuiSvgIcon-root': { color: '#9CA3AF' },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="active">نشط</MenuItem>
            <MenuItem value="scheduled">مجدول</MenuItem>
            <MenuItem value="expired">منتهي</MenuItem>
            <MenuItem value="disabled">معطل</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>نوع الكوبون</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as CouponType | 'all');
              setPage(1);
            }}
            label="نوع الكوبون"
            sx={{
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
              '& .MuiSvgIcon-root': { color: '#9CA3AF' },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="percentage">نسبة مئوية</MenuItem>
            <MenuItem value="fixed">قيمة ثابتة</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="ابحث عن كوبون..."
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
      ) : coupons.length === 0 ? (
        <EmptyState
          title="لا توجد كوبونات"
          description="لم يتم العثور على أي كوبونات لعرضها."
        />
      ) : (
        <>
          <DataTable
            data={coupons}
            columns={columns}
            searchable={false}
            onEdit={(row) => openEditDialog(row as Coupon)}
            onDelete={(row) => handleDelete(row as Coupon)}
            onView={(row) => openEditDialog(row as Coupon)}
          />

          {/* Pagination */}
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
              إجمالي النتائج: {data?.pagination.total ?? coupons.length} | الصفحة{' '}
              {data?.pagination.page ?? 1} من {data?.pagination.totalPages ?? 1}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
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
            minWidth: 520,
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>
          {editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
        </DialogTitle>
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
            <Box>
              <TextField
                label="كود الكوبون"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
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
            </Box>
            <Box>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: '#9CA3AF' }}>نوع الكوبون</InputLabel>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value as CouponType)}
                  label="نوع الكوبون"
                  sx={{
                    color: '#E5E7EB',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
                    '& .MuiSvgIcon-root': { color: '#9CA3AF' },
                    bgcolor: '#020617',
                  }}
                >
                  <MenuItem value="percentage">نسبة مئوية</MenuItem>
                  <MenuItem value="fixed">قيمة ثابتة</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <TextField
                label={type === 'percentage' ? 'قيمة الخصم (%)' : 'قيمة الخصم (ر.س)'}
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
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
            </Box>
            <Box>
              <TextField
                label="أقصى خصم (ر.س) - اختياري"
                type="number"
                value={maxDiscount}
                onChange={(e) =>
                  setMaxDiscount(e.target.value === '' ? '' : Number(e.target.value))
                }
                size="small"
                disabled={type !== 'percentage'}
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
            </Box>
            <Box>
              <TextField
                label="أقل قيمة طلب (ر.س) - اختياري"
                type="number"
                value={minOrderAmount}
                onChange={(e) =>
                  setMinOrderAmount(e.target.value === '' ? '' : Number(e.target.value))
                }
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
            </Box>
            <Box>
              <TextField
                label="عدد مرات الاستخدام - اختياري"
                type="number"
                value={usageLimit}
                onChange={(e) =>
                  setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))
                }
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
            </Box>
            <Box>
              <TextField
                label="تاريخ البداية"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
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
            <Box>
              <TextField
                label="تاريخ الانتهاء - اختياري"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
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
            <Box>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: '#9CA3AF' }}>حالة الكوبون</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CouponStatus)}
                  label="حالة الكوبون"
                  sx={{
                    color: '#E5E7EB',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
                    '& .MuiSvgIcon-root': { color: '#9CA3AF' },
                    bgcolor: '#020617',
                  }}
                >
                  <MenuItem value="active">نشط</MenuItem>
                  <MenuItem value="scheduled">مجدول</MenuItem>
                  <MenuItem value="expired">منتهي</MenuItem>
                  <MenuItem value="disabled">معطل</MenuItem>
                </Select>
              </FormControl>
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
            startIcon={editingCoupon ? <EditIcon /> : <AddIcon />}
            onClick={handleDialogSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingCoupon ? 'حفظ التعديلات' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CouponsListPage;


