import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MapIcon from '@mui/icons-material/Map';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGeofenceSettings,
  updateGeofenceSettings,
  GeofenceSettings,
  GeofenceVertex,
} from '../../services/api/geofence';
import { useSnackbar } from '../../hooks/useSnackbar';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const MAX_MESSAGE_LEN = 500;

function PolygonPreview({
  polygon,
  dimmed,
}: {
  polygon: GeofenceVertex[];
  dimmed?: boolean;
}) {
  const points = useMemo(() => {
    if (polygon.length < 2) return '';
    const lats = polygon.map((p) => p[0]);
    const lons = polygon.map((p) => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const w = 300;
    const h = 200;
    const pad = 12;
    return polygon
      .map(([lat, lon]) => {
        const x =
          pad + ((lon - minLon) / (maxLon - minLon || 1)) * (w - pad * 2);
        const y =
          pad + ((maxLat - lat) / (maxLat - minLat || 1)) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }, [polygon]);

  if (polygon.length < 2) {
    return (
      <Box
        sx={{
          height: 200,
          border: '1px dashed #B1C0B1',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FAFAFA',
          opacity: dimmed ? 0.5 : 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          أضف نقطتين على الأقل لمعاينة المضلع
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ opacity: dimmed ? 0.45 : 1 }}>
      <svg width="100%" viewBox="0 0 300 200" style={{ maxHeight: 220 }}>
        <rect x="0" y="0" width="300" height="200" fill="#F0F4EF" rx="8" />
        {polygon.length >= 3 && (
          <polygon
            points={points}
            fill="rgba(134, 181, 115, 0.35)"
            stroke="#86B573"
            strokeWidth="2"
          />
        )}
        {polygon.length === 2 && (
          <polyline
            points={points}
            fill="none"
            stroke="#86B573"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}
        {polygon.map(([lat, lon], i) => {
          const lats = polygon.map((p) => p[0]);
          const lons = polygon.map((p) => p[1]);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);
          const pad = 12;
          const x = pad + ((lon - minLon) / (maxLon - minLon || 1)) * (300 - pad * 2);
          const y = pad + ((maxLat - lat) / (maxLat - minLat || 1)) * (200 - pad * 2);
          return <circle key={i} cx={x} cy={y} r="5" fill="#2563EB" />;
        })}
      </svg>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
        المعاينة تقريبية — الترتيب: [خط العرض, خط الطول]
      </Typography>
    </Box>
  );
}

const GeofenceSettingsPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState<GeofenceSettings | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['geofence-settings'],
    queryFn: getGeofenceSettings,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => updateGeofenceSettings(form!),
    onSuccess: (saved) => {
      queryClient.setQueryData(['geofence-settings'], saved);
      setForm(saved);
      showSnackbar(
        'تم الحفظ — قد يستغرق تطبيق التغيير على الطلبات الحية حتى 30 ثانية',
        'success'
      );
    },
    onError: (e: Error) => showSnackbar(e.message || 'فشل الحفظ', 'error'),
  });

  const updateVertex = (index: number, coord: 0 | 1, value: string) => {
    if (!form) return;
    const next = [...form.polygon];
    const v = [...next[index]] as GeofenceVertex;
    v[coord] = value === '' ? 0 : Number(value);
    next[index] = v;
    setForm({ ...form, polygon: next });
  };

  const addVertex = () => {
    if (!form) return;
    const last = form.polygon[form.polygon.length - 1];
    const next: GeofenceVertex = last ? [last[0] + 0.01, last[1] + 0.01] : [30.05, 31.23];
    setForm({ ...form, polygon: [...form.polygon, next] });
  };

  const removeVertex = (index: number) => {
    if (!form) return;
    setForm({ ...form, polygon: form.polygon.filter((_, i) => i !== index) });
  };

  if (isLoading || !form) {
    return <SkeletonLoader variant="cards" count={2} />;
  }

  const vertexCount = form.polygon.length;
  const polygonWarning = vertexCount > 0 && vertexCount < 3;

  return (
    <Paper sx={{ bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #B1C0B1', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <MapIcon sx={{ color: '#86B573' }} />
        <Typography variant="h6" fontWeight={600}>
          منطقة التوصيل (Geofence)
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ color: '#5A6A5A', mb: 2 }}>
        حدّد مضلع منطقة الخدمة. عند التعطيل أو أقل من 3 نقاط، يعود النظام لسلوك المناطق القديم.
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            color="primary"
          />
        }
        label={
          <Typography fontWeight={600}>
            تفعيل Geofence {form.enabled ? '(مفعّل)' : '(معطّل)'}
          </Typography>
        }
        sx={{ mb: 2, display: 'block' }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Chip
          label={`${vertexCount} نقطة`}
          size="small"
          color={vertexCount >= 3 ? 'success' : vertexCount > 0 ? 'warning' : 'default'}
        />
        {polygonWarning && (
          <Typography variant="caption" color="warning.main">
            أقل من 3 نقاط — لن يُطبَّق المضلع على الطلبات (سلوك احتياطي)
          </Typography>
        )}
      </Box>

      <PolygonPreview polygon={form.polygon} dimmed={!form.enabled} />

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        رؤوس المضلع [خط العرض, خط الطول]
      </Typography>

      {form.polygon.map((vertex, index) => (
        <Box
          key={index}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr auto' },
            gap: 1,
            mb: 1,
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            label={`نقطة ${index + 1} — خط العرض`}
            type="number"
            inputProps={{ step: 'any' }}
            value={vertex[0]}
            onChange={(e) => updateVertex(index, 0, e.target.value)}
          />
          <TextField
            size="small"
            label={`نقطة ${index + 1} — خط الطول`}
            type="number"
            inputProps={{ step: 'any' }}
            value={vertex[1]}
            onChange={(e) => updateVertex(index, 1, e.target.value)}
          />
          <IconButton
            color="error"
            onClick={() => removeVertex(index)}
            aria-label="حذف النقطة"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button startIcon={<AddIcon />} onClick={addVertex} sx={{ mt: 1, mb: 3 }}>
        إضافة نقطة
      </Button>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          label="رسالة بالعربية (عند الرفض)"
          multiline
          minRows={2}
          value={form.message_ar}
          onChange={(e) =>
            setForm({ ...form, message_ar: e.target.value.slice(0, MAX_MESSAGE_LEN) })
          }
          helperText={`${form.message_ar.length}/${MAX_MESSAGE_LEN}`}
          fullWidth
        />
        <TextField
          label="رسالة بالإنجليزية"
          multiline
          minRows={2}
          value={form.message_en}
          onChange={(e) =>
            setForm({ ...form, message_en: e.target.value.slice(0, MAX_MESSAGE_LEN) })
          }
          helperText={`${form.message_en.length}/${MAX_MESSAGE_LEN}`}
          fullWidth
        />
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        بعد الحفظ، قد يستغرق ظهور التغيير في الطلبات الحية حتى 30 ثانية (كاش الخادم).
      </Alert>

      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        sx={{ bgcolor: '#86B573', '&:hover': { bgcolor: '#6B9A5A' } }}
      >
        حفظ إعدادات Geofence
      </Button>
    </Paper>
  );
};

export default GeofenceSettingsPanel;
