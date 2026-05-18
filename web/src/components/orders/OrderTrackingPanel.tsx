import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, Link } from '@mui/material';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { OrderTrackingDetail } from '../../services/api/orders';

interface Props {
  tracking: OrderTrackingDetail;
}

const OrderTrackingPanel: React.FC<Props> = ({ tracking }) => {
  const eta = tracking.estimated_time;

  return (
    <Paper sx={{ bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #B1C0B1', p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          تتبع الطلب
        </Typography>
        <Chip label={tracking.status} size="small" sx={{ bgcolor: '#86B57320', color: '#86B573' }} />
      </Box>

      {eta && (
        <Typography variant="body2" sx={{ color: '#5A6A5A', mb: 2 }}>
          الوقت المتوقع: {eta.min_minutes}–{eta.max_minutes} دقيقة
          {eta.is_delayed && (
            <Chip label="متأخر" size="small" color="warning" sx={{ ml: 1 }} />
          )}
        </Typography>
      )}

      {tracking.rider_info && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#F5F9F3', borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
            السائق
          </Typography>
          <Typography variant="body2">{tracking.rider_info.name}</Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A' }}>
            {tracking.rider_info.phone}
            {tracking.rider_info.vehicle && ` · ${tracking.rider_info.vehicle}`}
          </Typography>
          {tracking.rider_info.latitude != null && tracking.rider_info.longitude != null && (
            <Link
              href={`https://www.google.com/maps?q=${tracking.rider_info.latitude},${tracking.rider_info.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: 13, mt: 0.5, display: 'inline-block' }}
            >
              موقع السائق على الخريطة
            </Link>
          )}
        </Box>
      )}

      {tracking.delivery_address?.address_line && (
        <Typography variant="body2" sx={{ mb: 2, color: '#5A6A5A' }}>
          عنوان التوصيل: {tracking.delivery_address.address_line}
        </Typography>
      )}

      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        المسار
      </Typography>
      <List dense>
        {tracking.status_timeline.map((ev, i) => (
          <ListItem key={i}>
            <ListItemText
              primary={ev.label || ev.status}
              secondary={format(new Date(ev.timestamp), 'dd MMM yyyy HH:mm', { locale: ar })}
            />
          </ListItem>
        ))}
        {tracking.status_timeline.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            لا يوجد مسار مسجّل بعد
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default OrderTrackingPanel;
