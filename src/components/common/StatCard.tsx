import React from 'react';
import { Box, Typography } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  const isPositive = trend && trend.value >= 0;

  return (
    <Box
      sx={{
        height: { xs: 100, sm: 120 },
        borderRadius: 2,
        bgcolor: '#111827', // CardBackground
        border: '1px solid #1F2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 2.5, md: 3 }, // Responsive padding
        py: { xs: 2, sm: 2.5 }, // Responsive padding
        gap: { xs: 1.5, sm: 2 }, // Responsive gap
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: '#9CA3AF',
            letterSpacing: 0.3,
            fontSize: { xs: 11, sm: 12 },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#E5E7EB',
            fontWeight: 700,
            mt: 0.75,
            fontSize: { xs: 16, sm: 18, md: 20 },
          }}
        >
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              color: isPositive ? '#22C55E' : '#EF4444',
            }}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </Typography>
        )}
      </Box>
      {icon && (
        <Box
          sx={{
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            borderRadius: 2,
            bgcolor: '#020617',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#E5E7EB',
            '& svg': {
              fontSize: { xs: 20, sm: 24 },
            },
          }}
        >
          {icon}
        </Box>
      )}
    </Box>
  );
};

export default StatCard;
