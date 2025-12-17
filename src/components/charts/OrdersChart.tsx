import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

interface OrdersChartProps {
  data: Array<{ date: string; value: number }>;
  isLoading?: boolean;
}

const OrdersChart: React.FC<OrdersChartProps> = ({ data, isLoading }) => {
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
        الطلبات عبر الزمن
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              style={{ fontSize: 12 }}
              tick={{ fill: '#9CA3AF' }}
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
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ fill: '#2563EB', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default OrdersChart;

