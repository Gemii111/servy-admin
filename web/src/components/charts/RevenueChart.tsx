import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

interface RevenueChartProps {
  data: Array<{ date: string; value: number }>;
  isLoading?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading }) => {
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
        الإيرادات عبر الزمن
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(value) => [`${value ?? 0} ر.س`, 'الإيرادات']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default RevenueChart;

