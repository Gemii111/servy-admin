import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useQuery } from '@tanstack/react-query';
import StatCard from '../../components/common/StatCard';
import OrdersChart from '../../components/charts/OrdersChart';
import RevenueChart from '../../components/charts/RevenueChart';
import OrdersByStatusChart from '../../components/charts/OrdersByStatusChart';
import TopRestaurantsChart from '../../components/charts/TopRestaurantsChart';
import {
  mockGetDashboardStatistics,
  mockGetOrdersOverTime,
  mockGetRevenueOverTime,
  mockGetOrdersByStatus,
  mockGetTopRestaurants,
} from '../../services/api/dashboard';

const DashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'statistics'],
    queryFn: mockGetDashboardStatistics,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard', 'orders-over-time'],
    queryFn: mockGetOrdersOverTime,
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['dashboard', 'revenue-over-time'],
    queryFn: mockGetRevenueOverTime,
  });

  const { data: ordersByStatusData, isLoading: ordersByStatusLoading } = useQuery({
    queryKey: ['dashboard', 'orders-by-status'],
    queryFn: mockGetOrdersByStatus,
  });

  const { data: topRestaurantsData, isLoading: topRestaurantsLoading } = useQuery({
    queryKey: ['dashboard', 'top-restaurants'],
    queryFn: mockGetTopRestaurants,
  });

  return (
    <Box sx={{ color: '#E5E7EB' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3, // 24px - consistent section spacing
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2, // 16px - consistent gap
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            لوحة التحكم
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            نظرة عامة على النظام، الطلبات، والمستخدمين.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary">
            اليوم
          </Button>
          <Button variant="outlined" color="inherit">
            هذا الأسبوع
          </Button>
        </Box>
      </Box>

      {/* Stat cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
          columnGap: 2, // 16px - consistent horizontal gap
          rowGap: 2, // 16px - consistent vertical gap
          mb: 3, // 24px - consistent section spacing
        }}
      >
        <StatCard
          title="إجمالي المستخدمين"
          value={isLoading ? '...' : data?.totalUsers ?? 0}
          icon={<PeopleIcon />}
          trend={{ value: 8, direction: 'up' }}
        />
        <StatCard
          title="إجمالي الطلبات"
          value={isLoading ? '...' : data?.totalOrders ?? 0}
          icon={<ReceiptLongIcon />}
          trend={{ value: 3, direction: 'up' }}
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={isLoading ? '...' : `${data?.totalRevenue ?? 0} ر.س`}
          icon={<MonetizationOnIcon />}
          trend={{ value: -2, direction: 'down' }}
        />
        <StatCard
          title="المطاعم النشطة"
          value={isLoading ? '...' : data?.activeRestaurants ?? 0}
          icon={<RestaurantIcon />}
          trend={{ value: 4, direction: 'up' }}
        />
        <StatCard
          title="السائقون النشطون"
          value={isLoading ? '...' : data?.activeDrivers ?? 0}
          icon={<LocalShippingIcon />}
          trend={{ value: 1, direction: 'up' }}
        />
        <StatCard
          title="الطلبات المعلّقة"
          value={isLoading ? '...' : data?.pendingOrders ?? 0}
          icon={<HourglassEmptyIcon />}
          trend={{ value: -5, direction: 'down' }}
        />
      </Box>

      {/* Charts Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            md: 'repeat(2, minmax(0, 1fr))',
          },
          columnGap: 2, // 16px - consistent horizontal gap
          rowGap: 2, // 16px - consistent vertical gap
        }}
      >
        <OrdersChart data={ordersData || []} isLoading={ordersLoading} />
        <RevenueChart data={revenueData || []} isLoading={revenueLoading} />
        <OrdersByStatusChart data={ordersByStatusData || []} isLoading={ordersByStatusLoading} />
        <TopRestaurantsChart data={topRestaurantsData || []} isLoading={topRestaurantsLoading} />
      </Box>
    </Box>
  );
};

export default DashboardPage;