import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'لا توجد بيانات',
  description = 'لم يتم العثور على أي بيانات لعرضها.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: '#111827',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: '#6B7280',
        }}
      >
        {icon || <InboxIcon sx={{ fontSize: 32 }} />}
      </Box>
      <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;

