import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  Banner,
  BannerType,
  UserSegment,
  getBannerTypeLabel,
  getUserSegmentLabel,
} from '../../services/api/banners';
import { getRestaurants } from '../../services/api/restaurants';
import { uploadImage } from '../../utils/upload';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFFFF',
    '& fieldset': { borderColor: '#B1C0B1' },
    '&:hover fieldset': { borderColor: '#374151' },
  },
  '& .MuiInputBase-input': { color: '#1A2E1A' },
  '& .MuiInputLabel-root': { color: '#5A6A5A' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#86B573' },
};

const toIsoDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toISOString();
};

const toDateInput = (iso: string) => {
  if (!iso) return '';
  try {
    return iso.slice(0, 10);
  } catch {
    return '';
  }
};

const BannersListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<BannerType | 'all'>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerType, setBannerType] = useState<BannerType>('platform_offer');
  const [imageUrl, setImageUrl] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [priority, setPriority] = useState<number | ''>(10);
  const [userSegment, setUserSegment] = useState<UserSegment>('all');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['banners', activeFilter, typeFilter],
    queryFn: () =>
      getBanners({
        is_active:
          activeFilter === 'all' ? undefined : activeFilter === 'active',
        banner_type: typeFilter === 'all' ? undefined : typeFilter,
      }),
  });

  const { data: restaurantsData, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['restaurants', 'banner-picker'],
    queryFn: () => getRestaurants({ page: 1, limit: 100 }),
    enabled: dialogOpen,
  });

  const restaurantSelectOptions = useMemo(() => {
    const list = [...(restaurantsData?.restaurants ?? [])];
    if (
      restaurantId &&
      !list.some((r) => r.id === restaurantId)
    ) {
      list.unshift({
        id: restaurantId,
        name: `مطعم محفوظ (${restaurantId.slice(0, 8)}…)`,
      } as (typeof list)[0]);
    }
    return list;
  }, [restaurantsData?.restaurants, restaurantId]);

  const restaurantSelectValue =
    restaurantId && restaurantSelectOptions.some((r) => r.id === restaurantId)
      ? restaurantId
      : '';

  const resetForm = () => {
    setEditingBanner(null);
    setTitle('');
    setDescription('');
    setBannerType('platform_offer');
    setImageUrl('');
    setActionUrl('');
    setRestaurantId('');
    setPriority(10);
    setUserSegment('all');
    setIsActive(true);
    setStartDate('');
    setEndDate('');
  };

  const openCreateDialog = () => {
    resetForm();
    const today = new Date().toISOString().slice(0, 10);
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setStartDate(today);
    setEndDate(nextMonth);
    setDialogOpen(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setDescription(banner.description);
    setBannerType(banner.banner_type);
    setImageUrl(banner.image_url);
    setActionUrl(banner.action_url || '');
    setRestaurantId(banner.restaurant_id || '');
    setPriority(banner.priority);
    setUserSegment(banner.user_segment);
    setIsActive(banner.is_active);
    setStartDate(toDateInput(banner.start_date));
    setEndDate(toDateInput(banner.end_date));
    setDialogOpen(true);
  };

  const buildPayload = (): Partial<Banner> => ({
    title: title.trim(),
    description: description.trim(),
    banner_type: bannerType,
    image_url: imageUrl.trim(),
    action_url: actionUrl.trim() || undefined,
    restaurant_id:
      bannerType === 'restaurant_promo' && restaurantId ? restaurantId : undefined,
    priority: priority === '' ? 0 : Number(priority),
    user_segment: userSegment,
    is_active: isActive,
    start_date: toIsoDate(startDate),
    end_date: toIsoDate(endDate),
  });

  const createMutation = useMutation({
    mutationFn: () => createBanner(buildPayload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      showSnackbar('تم إنشاء البانر بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => showSnackbar(err.message || 'فشل إنشاء البانر', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      editingBanner
        ? updateBanner(editingBanner.id, buildPayload())
        : Promise.reject(new Error('لا يوجد بانر للتعديل')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      showSnackbar('تم تحديث البانر بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => showSnackbar(err.message || 'فشل تحديث البانر', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (banner: Banner) => deleteBanner(banner.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      showSnackbar('تم حذف البانر', 'success');
    },
    onError: (err: Error) => showSnackbar(err.message || 'فشل حذف البانر', 'error'),
  });

  const handleSave = () => {
    if (!title.trim() || !imageUrl.trim() || !startDate || !endDate) {
      showSnackbar('الرجاء إدخال العنوان ورابط الصورة وتواريخ البداية والنهاية', 'warning');
      return;
    }
    if (bannerType === 'restaurant_promo' && !restaurantId) {
      showSnackbar('اختر المطعم لعرض المطعم', 'warning');
      return;
    }
    if (editingBanner) updateMutation.mutate();
    else createMutation.mutate();
  };

  const handleDelete = (banner: Banner) => {
    if (window.confirm(`حذف البانر "${banner.title}"؟`)) {
      deleteMutation.mutate(banner);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showSnackbar('يرجى اختيار ملف صورة', 'warning');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, 'banners');
      setImageUrl(url);
      showSnackbar('تم رفع الصورة', 'success');
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : 'فشل رفع الصورة — استخدم رابطاً مباشراً',
        'error'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const columns = useMemo<ColumnDef<Banner>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'العنوان',
        cell: (info) => (
          <Typography sx={{ color: '#1A2E1A', fontWeight: 600, fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'banner_type',
        header: 'النوع',
        cell: (info) => (
          <Chip
            label={getBannerTypeLabel(info.getValue() as BannerType)}
            size="small"
            sx={{ bgcolor: 'rgba(134, 181, 115, 0.2)', color: '#86B573', fontSize: 12 }}
          />
        ),
      },
      {
        accessorKey: 'priority',
        header: 'الأولوية',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>{String(info.getValue())}</Typography>
        ),
      },
      {
        accessorKey: 'user_segment',
        header: 'الشريحة',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {getUserSegmentLabel(info.getValue() as UserSegment)}
          </Typography>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'الحالة',
        cell: (info) => (
          <Chip
            label={info.getValue() ? 'نشط' : 'غير نشط'}
            size="small"
            sx={{
              bgcolor: info.getValue() ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: info.getValue() ? '#22C55E' : '#EF4444',
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
            {info.getValue()
              ? format(new Date(String(info.getValue())), 'dd MMM yyyy', { locale: ar })
              : '-'}
          </Typography>
        ),
      },
    ],
    []
  );

  const banners = data || [];
  const saving = createMutation.isPending || updateMutation.isPending;

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
            البانرات
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A', fontSize: { xs: 12, sm: 14 } }}>
            تظهر في تطبيق العميل عبر GET /banners عند تفعيلها وضمن المدة
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreateDialog}>
          إضافة بانر
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>الحالة</InputLabel>
          <Select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            label="الحالة"
            sx={{ bgcolor: '#FFFFFF' }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="active">نشط</MenuItem>
            <MenuItem value="inactive">غير نشط</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>نوع البانر</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as BannerType | 'all')}
            label="نوع البانر"
            sx={{ bgcolor: '#FFFFFF' }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="restaurant_promo">عرض مطعم</MenuItem>
            <MenuItem value="platform_offer">عرض المنصة</MenuItem>
            <MenuItem value="campaign">حملة</MenuItem>
            <MenuItem value="custom">مخصص</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <SkeletonLoader variant="table" count={5} />
      ) : banners.length === 0 ? (
        <EmptyState
          title="لا توجد بانرات"
          description="أنشئ بانراً نشطاً ليظهر في شاشة العميل الرئيسية."
          actionLabel="إضافة بانر"
          onAction={openCreateDialog}
        />
      ) : (
        <DataTable
          data={banners}
          columns={columns}
          searchable={false}
          isLoading={isLoading}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onView={openEditDialog}
        />
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#FFFFFF', borderRadius: 2 } }}
      >
        <DialogTitle sx={{ color: '#1A2E1A' }}>
          {editingBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="العنوان *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="small"
              fullWidth
              sx={fieldSx}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>نوع البانر</InputLabel>
              <Select
                value={bannerType}
                label="نوع البانر"
                onChange={(e) => setBannerType(e.target.value as BannerType)}
              >
                <MenuItem value="platform_offer">عرض المنصة</MenuItem>
                <MenuItem value="restaurant_promo">عرض مطعم</MenuItem>
                <MenuItem value="campaign">حملة</MenuItem>
                <MenuItem value="custom">مخصص</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="الوصف"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={2}
              sx={{ gridColumn: '1 / -1', ...fieldSx }}
            />
            <TextField
              label="رابط الصورة *"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              size="small"
              fullWidth
              placeholder="https://..."
              sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, ...fieldSx }}
            />
            <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                رفع صورة
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
              {imageUrl ? (
                <Box
                  component="img"
                  src={imageUrl}
                  alt="معاينة"
                  sx={{ height: 48, maxWidth: 160, objectFit: 'cover', borderRadius: 1 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
            </Box>
            <TextField
              label="رابط الإجراء (deep link)"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              size="small"
              fullWidth
              placeholder="souq://promo/..."
              sx={fieldSx}
            />
            <TextField
              label="الأولوية (أعلى = أولاً)"
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value === '' ? '' : Number(e.target.value))}
              size="small"
              fullWidth
              sx={fieldSx}
            />
            {bannerType === 'restaurant_promo' && (
              <FormControl size="small" fullWidth disabled={restaurantsLoading}>
                <InputLabel>المطعم *</InputLabel>
                <Select
                  value={restaurantSelectValue}
                  label="المطعم *"
                  onChange={(e) => setRestaurantId(e.target.value)}
                >
                  <MenuItem value="">— اختر —</MenuItem>
                  {restaurantSelectOptions.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl size="small" fullWidth>
              <InputLabel>شريحة المستخدم</InputLabel>
              <Select
                value={userSegment}
                label="شريحة المستخدم"
                onChange={(e) => setUserSegment(e.target.value as UserSegment)}
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="new_user">مستخدم جديد</MenuItem>
                <MenuItem value="loyal_user">عميل مخلص</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="تاريخ البداية *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
            <TextField
              label="تاريخ النهاية *"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
            <FormControlLabel
              control={
                <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              }
              label="نشط (يظهر للعميل)"
              sx={{ gridColumn: '1 / -1' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}
          >
            إلغاء
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'جاري الحفظ...' : editingBanner ? 'حفظ التعديلات' : 'إنشاء'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BannersListPage;
