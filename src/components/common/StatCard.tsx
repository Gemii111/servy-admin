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
        height: 120,
        borderRadius: 2,
        bgcolor: '#111827', // CardBackground
        border: '1px solid #1F2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3, // 24px - consistent horizontal padding
        py: 2.5, // 20px - consistent vertical padding
        gap: 2, // 16px - consistent gap between content
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{ color: '#9CA3AF', letterSpacing: 0.3 }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: '#E5E7EB', fontWeight: 700, mt: 0.75 }}
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
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: '#020617',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#E5E7EB',
          }}
        >
          {icon}
        </Box>
      )}
    </Box>
  );
};

export default StatCard;
