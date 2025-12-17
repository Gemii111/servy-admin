import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentIcon from '@mui/icons-material/Payment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { mockGetSettings, mockUpdateSettings, AppSettings } from '../../services/api/settings';
import { useSnackbar } from '../../hooks/useSnackbar';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: mockGetSettings,
  });

  const [activeSection, setActiveSection] = useState<keyof AppSettings>('general');
  const [formData, setFormData] = useState<Partial<AppSettings>>({});

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: ({ section, data }: { section: keyof AppSettings; data: any }) =>
      mockUpdateSettings(section, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['settings'], data);
      showSnackbar('تم حفظ الإعدادات بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء حفظ الإعدادات', 'error');
    },
  });

  const handleSave = (section: keyof AppSettings) => {
    if (formData[section]) {
      updateMutation.mutate({ section, data: formData[section] });
    }
  };

  const handleChange = (section: keyof AppSettings, key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const sections = [
    { key: 'general' as keyof AppSettings, label: 'الإعدادات العامة', icon: <SettingsIcon /> },
    { key: 'payment' as keyof AppSettings, label: 'إعدادات الدفع', icon: <PaymentIcon /> },
    {
      key: 'notifications' as keyof AppSettings,
      label: 'الإشعارات',
      icon: <NotificationsIcon />,
    },
    {
      key: 'delivery' as keyof AppSettings,
      label: 'إعدادات التوصيل',
      icon: <LocalShippingIcon />,
    },
    {
      key: 'restaurant' as keyof AppSettings,
      label: 'إعدادات المطاعم',
      icon: <RestaurantIcon />,
    },
  ];

  if (isLoading) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  if (!settings) {
    return null;
  }

  return (
    <Box sx={{ color: '#E5E7EB' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            mb={0.5}
            sx={{ fontSize: { xs: 20, sm: 24 } }}
          >
            الإعدادات
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            إدارة إعدادات النظام العامة
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 3,
        }}
      >
        {/* Sidebar */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 2,
            height: 'fit-content',
          }}
        >
          {sections.map((section) => (
            <Box
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                mb: 1,
                cursor: 'pointer',
                bgcolor: activeSection === section.key ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                color: activeSection === section.key ? '#2563EB' : '#9CA3AF',
                '&:hover': {
                  bgcolor: 'rgba(15, 23, 42, 0.9)',
                },
              }}
            >
              {section.icon}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: activeSection === section.key ? 600 : 400,
                }}
              >
                {section.label}
              </Typography>
            </Box>
          ))}
        </Paper>

        {/* Content */}
        <Box
          sx={{
            gridColumn: { xs: '1', md: '2 / -1' },
          }}
        >
          {/* General Settings */}
          {activeSection === 'general' && (
            <Paper
              sx={{
                bgcolor: '#111827',
                borderRadius: 2,
                border: '1px solid #1F2937',
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
                الإعدادات العامة
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <TextField
                  label="اسم التطبيق"
                  value={formData.general?.appName || ''}
                  onChange={(e) => handleChange('general', 'appName', e.target.value)}
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
                <TextField
                  label="المنطقة الزمنية"
                  value={formData.general?.timezone || ''}
                  onChange={(e) => handleChange('general', 'timezone', e.target.value)}
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
                <TextField
                  label="العملة"
                  value={formData.general?.currency || ''}
                  onChange={(e) => handleChange('general', 'currency', e.target.value)}
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
                <TextField
                  label="نسبة الضريبة (%)"
                  type="number"
                  value={formData.general?.taxRate || 0}
                  onChange={(e) => handleChange('general', 'taxRate', Number(e.target.value))}
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
                <TextField
                  label="رسوم التوصيل (ر.س)"
                  type="number"
                  value={formData.general?.deliveryFee || 0}
                  onChange={(e) => handleChange('general', 'deliveryFee', Number(e.target.value))}
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
                <TextField
                  label="أقل قيمة طلب (ر.س)"
                  type="number"
                  value={formData.general?.minOrderAmount || 0}
                  onChange={(e) => handleChange('general', 'minOrderAmount', Number(e.target.value))}
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

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('general')}
                disabled={updateMutation.isPending}
              >
                حفظ الإعدادات
              </Button>
            </Paper>
          )}

          {/* Payment Settings */}
          {activeSection === 'payment' && (
            <Paper
              sx={{
                bgcolor: '#111827',
                borderRadius: 2,
                border: '1px solid #1F2937',
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
                إعدادات الدفع
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <TextField
                  label="نسبة العمولة (%)"
                  type="number"
                  value={formData.payment?.commissionRate || 0}
                  onChange={(e) => handleChange('payment', 'commissionRate', Number(e.target.value))}
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
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: '#9CA3AF' }}>جدول الدفع</InputLabel>
                  <Select
                    value={formData.payment?.payoutSchedule || 'weekly'}
                    onChange={(e) => handleChange('payment', 'payoutSchedule', e.target.value)}
                    label="جدول الدفع"
                    sx={{
                      color: '#E5E7EB',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
                      '& .MuiSvgIcon-root': { color: '#9CA3AF' },
                      bgcolor: '#020617',
                    }}
                  >
                    <MenuItem value="daily">يومي</MenuItem>
                    <MenuItem value="weekly">أسبوعي</MenuItem>
                    <MenuItem value="monthly">شهري</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.payment?.autoPayout || false}
                      onChange={(e) => handleChange('payment', 'autoPayout', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#2563EB',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#2563EB',
                        },
                      }}
                    />
                  }
                  label="دفع تلقائي"
                  sx={{ color: '#E5E7EB' }}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('payment')}
                disabled={updateMutation.isPending}
              >
                حفظ الإعدادات
              </Button>
            </Paper>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <Paper
              sx={{
                bgcolor: '#111827',
                borderRadius: 2,
                border: '1px solid #1F2937',
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
                الإشعارات
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications?.emailEnabled || false}
                      onChange={(e) => handleChange('notifications', 'emailEnabled', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#2563EB',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#2563EB',
                        },
                      }}
                    />
                  }
                  label="تفعيل الإشعارات عبر البريد الإلكتروني"
                  sx={{ color: '#E5E7EB' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications?.smsEnabled || false}
                      onChange={(e) => handleChange('notifications', 'smsEnabled', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#2563EB',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#2563EB',
                        },
                      }}
                    />
                  }
                  label="تفعيل الإشعارات عبر الرسائل النصية"
                  sx={{ color: '#E5E7EB' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications?.pushEnabled || false}
                      onChange={(e) => handleChange('notifications', 'pushEnabled', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#2563EB',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#2563EB',
                        },
                      }}
                    />
                  }
                  label="تفعيل الإشعارات الفورية"
                  sx={{ color: '#E5E7EB' }}
                />
                <Divider sx={{ borderColor: '#1F2937', my: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications?.orderNotifications || false}
                      onChange={(e) =>
                        handleChange('notifications', 'orderNotifications', e.target.checked)
                      }
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#2563EB',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#2563EB',
                        },
                      }}
                    />
                  }
                  label="إشعارات الطلبات"
                  sx={{ color: '#E5E7EB' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications?.marketingNotifications || false}
                      onChange={(e) =>
                        handleChange('notifications', 'marketingNotifications', e.target.checked)
                      }
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#2563EB',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#2563EB',
                        },
                      }}
                    />
                  }
                  label="الإشعارات التسويقية"
                  sx={{ color: '#E5E7EB' }}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('notifications')}
                disabled={updateMutation.isPending}
              >
                حفظ الإعدادات
              </Button>
            </Paper>
          )}

          {/* Delivery Settings */}
          {activeSection === 'delivery' && (
            <Paper
              sx={{
                bgcolor: '#111827',
                borderRadius: 2,
                border: '1px solid #1F2937',
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
                إعدادات التوصيل
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <TextField
                  label="أقصى مسافة توصيل (كم)"
                  type="number"
                  value={formData.delivery?.maxDeliveryDistance || 0}
                  onChange={(e) =>
                    handleChange('delivery', 'maxDeliveryDistance', Number(e.target.value))
                  }
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
                <TextField
                  label="الوقت المتوقع للتوصيل (دقيقة)"
                  type="number"
                  value={formData.delivery?.estimatedDeliveryTime || 0}
                  onChange={(e) =>
                    handleChange('delivery', 'estimatedDeliveryTime', Number(e.target.value))
                  }
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
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: '#9CA3AF' }}>تعيين السائق</InputLabel>
                  <Select
                    value={formData.delivery?.driverAssignment || 'auto'}
                    onChange={(e) => handleChange('delivery', 'driverAssignment', e.target.value)}
                    label="تعيين السائق"
                    sx={{
                      color: '#E5E7EB',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
                      '& .MuiSvgIcon-root': { color: '#9CA3AF' },
                      bgcolor: '#020617',
                    }}
                  >
                    <MenuItem value="auto">تلقائي</MenuItem>
                    <MenuItem value="manual">يدوي</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('delivery')}
                disabled={updateMutation.isPending}
              >
                حفظ الإعدادات
              </Button>
            </Paper>
          )}

          {/* Restaurant Settings */}
          {activeSection === 'restaurant' && (
            <Paper
              sx={{
                bgcolor: '#111827',
                borderRadius: 2,
                border: '1px solid #1F2937',
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
                إعدادات المطاعم
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.restaurant?.autoApprove || false}
                      onChange={(e) => handleChange('restaurant', 'autoApprove', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#2563EB',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#2563EB',
                        },
                      }}
                    />
                  }
                  label="الموافقة التلقائية على المطاعم الجديدة"
                  sx={{ color: '#E5E7EB' }}
                />
                <TextField
                  label="نسبة العمولة للمطاعم (%)"
                  type="number"
                  value={formData.restaurant?.commissionRate || 0}
                  onChange={(e) =>
                    handleChange('restaurant', 'commissionRate', Number(e.target.value))
                  }
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
                <TextField
                  label="أقل تقييم مطلوب"
                  type="number"
                  value={formData.restaurant?.minRating || 0}
                  onChange={(e) => handleChange('restaurant', 'minRating', Number(e.target.value))}
                  size="small"
                  fullWidth
                  inputProps={{ step: 0.1, min: 0, max: 5 }}
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

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('restaurant')}
                disabled={updateMutation.isPending}
              >
                حفظ الإعدادات
              </Button>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;

