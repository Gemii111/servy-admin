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
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          border: '1px solid #B1C0B1',
          p: 3,
          height: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: '#5A6A5A' }}>جاري التحميل...</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: 2,
        border: '1px solid #B1C0B1',
        p: 3,
      }}
    >
      <Typography variant="h6" sx={{ color: '#1A2E1A', mb: 2.5, fontWeight: 600, fontSize: 16 }}>
        أفضل المطاعم
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#B1C0B1" />
            <XAxis
              dataKey="name"
              stroke="#5A6A5A"
              style={{ fontSize: 12 }}
              tick={{ fill: '#5A6A5A' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#5A6A5A" style={{ fontSize: 12 }} tick={{ fill: '#5A6A5A' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #B1C0B1',
                borderRadius: 8,
                color: '#1A2E1A',
              }}
            />
            <Bar dataKey="orders" fill="#86B573" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default TopRestaurantsChart;

