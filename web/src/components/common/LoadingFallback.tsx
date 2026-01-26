/**
 * Loading Fallback Component
 * 
 * This component is shown while lazy-loaded components are being loaded.
 */

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingFallbackProps {
  message?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = 'جاري التحميل...' 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
      }}
    >
      <CircularProgress size={48} sx={{ color: '#3B82F6' }} />
      <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingFallback;

