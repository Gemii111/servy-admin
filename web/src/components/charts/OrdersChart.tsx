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
        الطلبات عبر الزمن
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#B1C0B1" />
            <XAxis
              dataKey="date"
              stroke="#5A6A5A"
              style={{ fontSize: 12 }}
              tick={{ fill: '#5A6A5A' }}
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
            <Line
              type="monotone"
              dataKey="value"
              stroke="#86B573"
              strokeWidth={2}
              dot={{ fill: '#86B573', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default OrdersChart;

