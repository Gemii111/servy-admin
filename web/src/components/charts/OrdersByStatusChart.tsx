import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieLabelRenderProps,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

interface OrdersByStatusChartProps {
  data: Array<{ status: string; count: number }>;
  isLoading?: boolean;
}

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#38BDF8'];

const OrdersByStatusChart: React.FC<OrdersByStatusChartProps> = ({ data, isLoading }) => {
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
        الطلبات حسب الحالة
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: PieLabelRenderProps) => {
                const { index, percent } = props;
                const item = data[index ?? 0];
                const pct = percent ?? 0;
                return `${item?.status}: ${(pct * 100).toFixed(0)}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #1F2937',
                borderRadius: 8,
                color: '#E5E7EB',
              }}
            />
            <Legend
              wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }}
              iconType="circle"
              formatter={(value) => <span style={{ color: '#E5E7EB' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default OrdersByStatusChart;

