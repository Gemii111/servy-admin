import React from 'react';
import { Box, Skeleton, Paper } from '@mui/material';

interface SkeletonLoaderProps {
  variant?: 'table' | 'cards' | 'chart';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'cards',
  count = 6,
}) => {
  if (variant === 'table') {
    return (
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1, mb: 2 }} />
        </Box>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1, mb: 1 }}
          />
        ))}
      </Paper>
    );
  }

  if (variant === 'cards') {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
          columnGap: 2,
          rowGap: 2,
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Box>
    );
  }

  if (variant === 'chart') {
    return (
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
          height: 380,
        }}
      >
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2.5 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
      </Paper>
    );
  }

  return null;
};

export default SkeletonLoader;

