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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  sendCampaignNotification,
  Campaign,
  UserSegment,
  getCampaignStatusLabel,
  getCampaignUserSegmentLabel,
  getCampaignFcmTopic,
} from '../../services/api/campaigns';
import Alert from '@mui/material/Alert';
import { getBanners } from '../../services/api/banners';
import { getCoupons } from '../../services/api/coupons';
import { getRestaurants } from '../../services/api/restaurants';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';

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

const toDateInput = (iso: string) => (iso ? iso.slice(0, 10) : '');

const CampaignsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Campaign['status']>('draft');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userSegment, setUserSegment] = useState<UserSegment>('all');
  const [restaurantId, setRestaurantId] = useState('');
  const [bannerId, setBannerId] = useState('');
  const [couponId, setCouponId] = useState('');
  const [loyaltyBonus, setLoyaltyBonus] = useState<number | ''>('');
  const [loyaltyMultiplier, setLoyaltyMultiplier] = useState<number | ''>('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', statusFilter],
    queryFn: () => getCampaigns({ status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const { data: restaurantsData, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['restaurants', 'campaign-picker'],
    queryFn: () => getRestaurants({ page: 1, limit: 100 }),
    enabled: dialogOpen,
  });

  const { data: bannersData, isLoading: bannersLoading } = useQuery({
    queryKey: ['banners', 'campaign-picker'],
    queryFn: () => getBanners(),
    enabled: dialogOpen,
  });

  const { data: couponsData, isLoading: couponsLoading } = useQuery({
    queryKey: ['coupons', 'campaign-picker'],
    queryFn: () => getCoupons({ status: 'active', limit: 100 }),
    enabled: dialogOpen,
  });

  const sendNotificationMutation = useMutation({
    mutationFn: (campaign: Campaign) => sendCampaignNotification(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showSnackbar('تم إرسال إشعار الحملة للمستخدمين (Push)', 'success');
    },
    onError: (err: Error) => showSnackbar(err.message || 'فشل إرسال الإشعار', 'error'),
  });

  const resetForm = () => {
    setEditingCampaign(null);
    setName('');
    setDescription('');
    setStatus('draft');
    setStartDate('');
    setEndDate('');
    setUserSegment('all');
    setRestaurantId('');
    setBannerId('');
    setCouponId('');
    setLoyaltyBonus('');
    setLoyaltyMultiplier('');
    setNotificationTitle('');
    setNotificationBody('');
  };

  const openCreateDialog = () => {
    resetForm();
    const today = new Date().toISOString().slice(0, 10);
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setStartDate(today);
    setEndDate(nextMonth);
    setDialogOpen(true);
  };

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setName(campaign.name);
    setDescription(campaign.description);
    setStatus(campaign.status);
    setStartDate(toDateInput(campaign.start_date));
    setEndDate(toDateInput(campaign.end_date));
    setUserSegment(campaign.user_segment);
    setRestaurantId(campaign.restaurant_id || '');
    setBannerId(campaign.banner_id || '');
    setCouponId(campaign.coupon_id || '');
    setLoyaltyBonus(campaign.loyalty_bonus_points ?? '');
    setLoyaltyMultiplier(campaign.loyalty_multiplier ?? '');
    setNotificationTitle(campaign.notification_title || '');
    setNotificationBody(campaign.notification_body || '');
    setDialogOpen(true);
  };

  const buildPayload = (): Partial<Campaign> => ({
    name: name.trim(),
    description: description.trim(),
    status,
    start_date: startDate,
    end_date: endDate,
    user_segment: userSegment,
    restaurant_id: restaurantId || undefined,
    banner_id: bannerId || undefined,
    coupon_id: couponId || undefined,
    loyalty_bonus_points: loyaltyBonus === '' ? undefined : Number(loyaltyBonus),
    loyalty_multiplier: loyaltyMultiplier === '' ? undefined : Number(loyaltyMultiplier),
    notification_title: notificationTitle.trim() || undefined,
    notification_body: notificationBody.trim() || undefined,
  });

  const createMutation = useMutation({
    mutationFn: () => createCampaign(buildPayload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showSnackbar('تم إنشاء الحملة بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => showSnackbar(err.message || 'فشل إنشاء الحملة', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      editingCampaign
        ? updateCampaign(editingCampaign.id, buildPayload())
        : Promise.reject(new Error('لا توجد حملة للتعديل')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showSnackbar('تم تحديث الحملة بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => showSnackbar(err.message || 'فشل تحديث الحملة', 'error'),
  });

  const handleSave = () => {
    if (!name.trim() || !startDate || !endDate) {
      showSnackbar('الرجاء إدخال اسم الحملة وتواريخ البداية والنهاية', 'warning');
      return;
    }
    if (editingCampaign) updateMutation.mutate();
    else createMutation.mutate();
  };

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
        accessorKey: 'status',
        header: 'الحالة',
        cell: (info) => {
          const s = String(info.getValue());
          const colors: Record<string, string> = {
            active: '#22C55E',
            inactive: '#5A6A5A',
            expired: '#EF4444',
            draft: '#94A3B8',
          };
          return (
            <Chip
              label={getCampaignStatusLabel(s)}
              size="small"
              sx={{
                bgcolor: `${colors[s] || '#5A6A5A'}20`,
                color: colors[s] || '#5A6A5A',
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'user_segment',
        header: 'الشريحة',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {getCampaignUserSegmentLabel(info.getValue() as UserSegment)}
          </Typography>
        ),
      },
      {
        accessorKey: 'coupon_id',
        header: 'كوبون',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 12 }}>
            {info.getValue() ? 'مرتبط' : '—'}
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
        header: 'إشعار',
        cell: ({ row }) => {
          const campaign = row.original;
          return (
            <Button
              size="small"
              variant="outlined"
              startIcon={<SendIcon />}
              disabled={campaign.notification_sent || sendNotificationMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                sendNotificationMutation.mutate(campaign);
              }}
              sx={{ borderColor: '#86B573', color: '#86B573', fontSize: 12 }}
            >
              إرسال
            </Button>
          );
        },
      },
    ],
    [sendNotificationMutation]
  );

  const campaigns = data || [];
  const saving = createMutation.isPending || updateMutation.isPending;

  const withSavedOption = <T extends { id: string; label: string }>(
    list: T[],
    savedId: string,
    fallbackPrefix: string
  ): T[] => {
    if (!savedId || list.some((x) => x.id === savedId)) return list;
    return [
      { id: savedId, label: `${fallbackPrefix} (${savedId.slice(0, 8)}…)` } as T,
      ...list,
    ];
  };

  const restaurantOptions = useMemo(() => {
    const list = restaurantsData?.restaurants ?? [];
    return withSavedOption(
      list.map((r) => ({ id: r.id, label: r.name })),
      restaurantId,
      'مطعم محفوظ'
    );
  }, [restaurantsData?.restaurants, restaurantId]);

  const bannerOptions = useMemo(() => {
    const list = bannersData ?? [];
    return withSavedOption(
      list.map((b) => ({ id: b.id, label: b.title })),
      bannerId,
      'بانر محفوظ'
    );
  }, [bannersData, bannerId]);

  const couponOptions = useMemo(() => {
    const list = couponsData?.coupons ?? [];
    return withSavedOption(
      list.map((c) => ({ id: c.id, label: c.code })),
      couponId,
      'كوبون محفوظ'
    );
  }, [couponsData?.coupons, couponId]);

  const selectValue = (id: string, options: { id: string }[]) =>
    id && options.some((o) => o.id === id) ? id : '';

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
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            الحملات
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
            العميل: GET /campaigns/active — الإشعار: POST .../notify → topic حسب الشريحة (مثلاً{' '}
            {getCampaignFcmTopic('all')})
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreateDialog}>
          إضافة حملة
        </Button>
      </Box>

      <FormControl size="small" sx={{ minWidth: 140, mb: 2 }}>
        <InputLabel>الحالة</InputLabel>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          label="الحالة"
          sx={{ bgcolor: '#FFFFFF' }}
        >
          <MenuItem value="all">الكل</MenuItem>
          <MenuItem value="draft">مسودة</MenuItem>
          <MenuItem value="active">نشط</MenuItem>
          <MenuItem value="inactive">غير نشط</MenuItem>
          <MenuItem value="expired">منتهي</MenuItem>
        </Select>
      </FormControl>

      {isLoading ? (
        <SkeletonLoader variant="table" count={5} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="لا توجد حملات"
          description="أنشئ حملة نشطة واربطها بكوبون أو بانر إن لزم."
          actionLabel="إضافة حملة"
          onAction={openCreateDialog}
        />
      ) : (
        <DataTable
          data={campaigns}
          columns={columns}
          searchable={false}
          isLoading={isLoading}
          onEdit={openEditDialog}
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
          {editingCampaign ? 'تعديل الحملة' : 'إضافة حملة جديدة'}
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
              label="اسم الحملة *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              fullWidth
              sx={fieldSx}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={status}
                label="الحالة"
                onChange={(e) => setStatus(e.target.value as Campaign['status'])}
              >
                <MenuItem value="draft">مسودة</MenuItem>
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="inactive">غير نشط</MenuItem>
                <MenuItem value="expired">منتهي</MenuItem>
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
            <FormControl size="small" fullWidth disabled={restaurantsLoading}>
              <InputLabel>مطعم (اختياري)</InputLabel>
              <Select
                value={selectValue(restaurantId, restaurantOptions)}
                label="مطعم (اختياري)"
                onChange={(e) => setRestaurantId(e.target.value)}
              >
                <MenuItem value="">— بدون —</MenuItem>
                {restaurantOptions.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth disabled={bannersLoading}>
              <InputLabel>بانر مرتبط</InputLabel>
              <Select
                value={selectValue(bannerId, bannerOptions)}
                label="بانر مرتبط"
                onChange={(e) => setBannerId(e.target.value)}
              >
                <MenuItem value="">— بدون —</MenuItem>
                {bannerOptions.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth disabled={couponsLoading}>
              <InputLabel>كوبون مرتبط</InputLabel>
              <Select
                value={selectValue(couponId, couponOptions)}
                label="كوبون مرتبط"
                onChange={(e) => setCouponId(e.target.value)}
              >
                <MenuItem value="">— بدون —</MenuItem>
                {couponOptions.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="نقاط ولاء إضافية"
              type="number"
              value={loyaltyBonus}
              onChange={(e) =>
                setLoyaltyBonus(e.target.value === '' ? '' : Number(e.target.value))
              }
              size="small"
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="مضاعف الولاء"
              type="number"
              inputProps={{ step: 0.1, min: 1 }}
              value={loyaltyMultiplier}
              onChange={(e) =>
                setLoyaltyMultiplier(e.target.value === '' ? '' : Number(e.target.value))
              }
              size="small"
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="عنوان الإشعار (اختياري)"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              size="small"
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="نص الإشعار (اختياري)"
              value={notificationBody}
              onChange={(e) => setNotificationBody(e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={2}
              sx={{ gridColumn: '1 / -1', ...fieldSx }}
            />
            <Alert severity="info" sx={{ gridColumn: '1 / -1' }}>
              عند «إرسال»: الباك يبعت FCM إلى topic{' '}
              <strong>{getCampaignFcmTopic(userSegment)}</strong> مع{' '}
              <code>data.type=campaign</code>. عند ضغط العميل على الإشعار: كوبون → مطعم → بانر →
              تفاصيل الحملة (يُنفَّذ في Flutter — انظر{' '}
              <code>campaign-notification-tap-flutter.md</code>).
            </Alert>
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
            {saving ? 'جاري الحفظ...' : editingCampaign ? 'حفظ التعديلات' : 'إنشاء'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignsListPage;
