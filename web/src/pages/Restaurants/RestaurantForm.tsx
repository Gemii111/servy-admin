import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  IconButton,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  getRestaurantById,
  updateRestaurant,
  createRestaurant,
  RestaurantUpdatePayload,
  CreateRestaurantPayload,
  VendorType,
} from '../../services/api/restaurants';

const PAYMENT_OPTIONS = ['cash', 'card', 'wallet'];

const RestaurantFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [ownerEmail, setOwnerEmail] = useState('');
  const [form, setForm] = useState<RestaurantUpdatePayload & { restaurant_name: string }>({
    restaurant_name: '',
    vendor_type: 'restaurant',
    accepted_payment_methods: ['cash', 'card'],
  });

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurantById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (restaurant) {
      setForm({
        restaurant_name: restaurant.name,
        description: restaurant.description,
        category: restaurant.cuisineType,
        address: restaurant.address,
        city: restaurant.city,
        phone: restaurant.phone,
        image_url: restaurant.imageUrl,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        min_order_amount: restaurant.minOrderAmount,
        delivery_fee: restaurant.deliveryFee,
        delivery_time: restaurant.deliveryTime,
        vendor_type: restaurant.vendorType,
        is_verified_seller: restaurant.isVerifiedSeller,
        return_policy_summary: restaurant.returnPolicySummary,
        return_policy_url: restaurant.returnPolicyUrl,
        supports_secure_payment: restaurant.supportsSecurePayment,
        delivery_badge_label: restaurant.deliveryBadgeLabel,
        delivery_guarantee: restaurant.deliveryGuarantee,
        accepted_payment_methods: restaurant.acceptedPaymentMethods ?? ['cash'],
      });
    }
  }, [restaurant]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEdit && id) {
        await updateRestaurant(id, form);
        return { id };
      }
      const payload: CreateRestaurantPayload = {
        owner_email: ownerEmail || undefined,
        restaurant_name: form.restaurant_name,
        description: form.description,
        category: form.category,
        address: form.address,
        city: form.city,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        phone: form.phone,
        min_order_amount: form.min_order_amount,
        image_url: form.image_url,
        delivery_fee: form.delivery_fee,
        delivery_time: form.delivery_time,
        vendor_type: form.vendor_type,
      };
      return createRestaurant(payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      showSnackbar(isEdit ? 'تم حفظ التعديلات' : 'تم إنشاء المتجر', 'success');
      navigate(isEdit ? `/restaurants/${id}` : `/restaurants/${res.id}`);
    },
    onError: (e: Error) => showSnackbar(e.message, 'error'),
  });

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const togglePayment = (method: string) => {
    const current = form.accepted_payment_methods ?? [];
    set(
      'accepted_payment_methods',
      current.includes(method) ? current.filter((m) => m !== method) : [...current, method]
    );
  };

  if (isEdit && isLoading) return <SkeletonLoader variant="cards" count={2} />;

  return (
    <Box sx={{ color: '#1A2E1A', maxWidth: 900 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(isEdit ? `/restaurants/${id}` : '/restaurants')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'تعديل المتجر' : 'إضافة متجر جديد'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3, border: '1px solid #B1C0B1' }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          الأساسيات
        </Typography>
        {!isEdit && (
          <TextField
            label="بريد المالك (مستخدم موجود)"
            fullWidth
            margin="normal"
            required
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            helperText="المستخدم يجب أن يكون مسجّلاً مسبقاً"
          />
        )}
        <TextField
          label="اسم المتجر"
          fullWidth
          margin="normal"
          required
          value={form.restaurant_name}
          onChange={(e) => set('restaurant_name', e.target.value)}
        />
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>نوع البائع</InputLabel>
          <Select
            value={form.vendor_type || 'restaurant'}
            label="نوع البائع"
            onChange={(e) => set('vendor_type', e.target.value as VendorType)}
          >
            <MenuItem value="restaurant">مطعم</MenuItem>
            <MenuItem value="pharmacy">صيدلية</MenuItem>
            <MenuItem value="supermarket">سوبرماركت</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="التصنيف"
          fullWidth
          margin="normal"
          value={form.category || ''}
          onChange={(e) => set('category', e.target.value)}
        />
        <TextField
          label="الوصف"
          fullWidth
          margin="normal"
          multiline
          rows={2}
          value={form.description || ''}
          onChange={(e) => set('description', e.target.value)}
        />
        <TextField
          label="الهاتف"
          fullWidth
          margin="normal"
          value={form.phone || ''}
          onChange={(e) => set('phone', e.target.value)}
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3, border: '1px solid #B1C0B1' }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          الموقع والتسعير
        </Typography>
        <TextField
          label="العنوان"
          fullWidth
          margin="normal"
          value={form.address || ''}
          onChange={(e) => set('address', e.target.value)}
        />
        <TextField
          label="المدينة"
          fullWidth
          margin="normal"
          value={form.city || ''}
          onChange={(e) => set('city', e.target.value)}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="خط العرض"
            type="number"
            required={!isEdit}
            fullWidth
            margin="normal"
            value={form.latitude ?? ''}
            onChange={(e) => set('latitude', Number(e.target.value))}
          />
          <TextField
            label="خط الطول"
            type="number"
            required={!isEdit}
            fullWidth
            margin="normal"
            value={form.longitude ?? ''}
            onChange={(e) => set('longitude', Number(e.target.value))}
          />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
          <TextField
            label="أقل طلب (ج.م)"
            type="number"
            fullWidth
            margin="normal"
            value={form.min_order_amount ?? ''}
            onChange={(e) => set('min_order_amount', Number(e.target.value))}
          />
          <TextField
            label="رسوم التوصيل"
            type="number"
            fullWidth
            margin="normal"
            value={form.delivery_fee ?? ''}
            onChange={(e) => set('delivery_fee', Number(e.target.value))}
          />
          <TextField
            label="وقت التوصيل (د)"
            type="number"
            fullWidth
            margin="normal"
            value={form.delivery_time ?? ''}
            onChange={(e) => set('delivery_time', Number(e.target.value))}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, border: '1px solid #B1C0B1' }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          عناصر الثقة (Trust)
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={form.is_verified_seller ?? false}
              onChange={(e) => set('is_verified_seller', e.target.checked)}
            />
          }
          label="بائع موثّق"
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.supports_secure_payment ?? false}
              onChange={(e) => set('supports_secure_payment', e.target.checked)}
            />
          }
          label="دفع آمن"
        />
        <TextField
          label="ملخص سياسة الاسترجاع"
          fullWidth
          margin="normal"
          value={form.return_policy_summary || ''}
          onChange={(e) => set('return_policy_summary', e.target.value)}
        />
        <TextField
          label="رابط سياسة الاسترجاع"
          fullWidth
          margin="normal"
          value={form.return_policy_url || ''}
          onChange={(e) => set('return_policy_url', e.target.value)}
        />
        <TextField
          label="شارة التوصيل"
          fullWidth
          margin="normal"
          value={form.delivery_badge_label || ''}
          onChange={(e) => set('delivery_badge_label', e.target.value)}
        />
        <TextField
          label="ضمان التوصيل"
          fullWidth
          margin="normal"
          value={form.delivery_guarantee || ''}
          onChange={(e) => set('delivery_guarantee', e.target.value)}
        />
        <Typography variant="body2" sx={{ mt: 2, mb: 1, color: '#5A6A5A' }}>
          طرق الدفع المقبولة
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {PAYMENT_OPTIONS.map((m) => (
            <Chip
              key={m}
              label={m}
              clickable
              color={(form.accepted_payment_methods ?? []).includes(m) ? 'primary' : 'default'}
              onClick={() => togglePayment(m)}
            />
          ))}
        </Box>
      </Paper>

      <Button
        variant="contained"
        size="large"
        disabled={saveMutation.isPending || !form.restaurant_name}
        onClick={() => saveMutation.mutate()}
      >
        {isEdit ? 'حفظ التعديلات' : 'إنشاء المتجر'}
      </Button>
    </Box>
  );
};

export default RestaurantFormPage;
