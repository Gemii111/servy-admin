import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

interface TopRestaurant {
  name: string;
  orders: number;
  revenue: number;
}

interface TopRestaurantsChartProps {
  data: TopRestaurant[];
  isLoading?: boolean;
}

const TopRestaurantsChart: React.FC<TopRestaurantsChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
          height: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: '#9CA3AF' }}>جاري التحميل...</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        bgcolor: '#111827',
        borderRadius: 2,
        border: '1px solid #1F2937',
        p: 3,
      }}
    >
      <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2.5, fontWeight: 600, fontSize: 16 }}>
        أفضل المطاعم
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              style={{ fontSize: 12 }}
              tick={{ fill: '#9CA3AF' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#6B7280" style={{ fontSize: 12 }} tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #1F2937',
                borderRadius: 8,
                color: '#E5E7EB',
              }}
            />
            <Bar dataKey="orders" fill="#2563EB" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default TopRestaurantsChart;

