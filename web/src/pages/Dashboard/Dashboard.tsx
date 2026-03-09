import React from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
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
  getDashboardStatistics,
  getOrdersOverTime,
  getRevenueOverTime,
  getOrdersByStatus,
  getTopRestaurants,
} from '../../services/api/dashboard';
import { getOrders } from '../../services/api/orders';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'statistics'],
    queryFn: getDashboardStatistics,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard', 'orders-over-time'],
    queryFn: getOrdersOverTime,
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['dashboard', 'revenue-over-time'],
    queryFn: getRevenueOverTime,
  });

  const { data: ordersByStatusData, isLoading: ordersByStatusLoading } = useQuery({
    queryKey: ['dashboard', 'orders-by-status'],
    queryFn: getOrdersByStatus,
  });

  const { data: topRestaurantsData, isLoading: topRestaurantsLoading } = useQuery({
    queryKey: ['dashboard', 'top-restaurants'],
    queryFn: getTopRestaurants,
  });

  const { data: ordersResponse, isLoading: recentOrdersLoading } = useQuery({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: () => getOrders({ page: 1, limit: 5 }),
  });
  const recentOrders = ordersResponse?.orders || [];
  const statusLabels: Record<string, string> = {
    pending: 'معلق',
    accepted: 'مقبول',
    preparing: 'قيد التحضير',
    delivered: 'تم التسليم',
    delivering: 'قيد التوصيل',
  };

  return (
    <Box sx={{ color: '#1A2E1A' }}>
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
          <Typography
            variant="h5"
            fontWeight={700}
            mb={0.5}
            sx={{ fontSize: { xs: 20, sm: 24 } }}
          >
            لوحة التحكم
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#5A6A5A', fontSize: { xs: 12, sm: 14 } }}
          >
            نظرة عامة على النظام، الطلبات، والمستخدمين.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 1.5 },
            flexWrap: 'wrap',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button variant="contained" color="primary" size="small">
            اليوم
          </Button>
          <Button variant="outlined" color="inherit" size="small">
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

      {/* آخر الطلبات */}
      <Paper
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 2,
          border: '1px solid #B1C0B1',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A2E1A' }}>
            آخر الطلبات
          </Typography>
          <Button size="small" onClick={() => navigate('/orders')} sx={{ color: '#86B573' }}>
            عرض الكل
          </Button>
        </Box>
        {recentOrdersLoading ? (
          <Typography sx={{ color: '#5A6A5A' }}>جاري التحميل...</Typography>
        ) : recentOrders && recentOrders.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {recentOrders.map((order: { id: string; orderNumber: string; customerName: string; restaurantName: string; status: string; total: number }) => (
              <Box
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(134,181,115,0.08)' },
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A2E1A' }}>
                    {order.orderNumber} • {order.restaurantName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5A6A5A' }}>
                    {order.customerName} • {order.total} ر.س
                  </Typography>
                </Box>
                <Chip
                  label={statusLabels[order.status] || order.status}
                  size="small"
                  sx={{
                    bgcolor: order.status === 'delivered' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
                    color: order.status === 'delivered' ? '#22C55E' : '#F59E0B',
                    fontSize: 11,
                  }}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ color: '#5A6A5A' }}>لا توجد طلبات حديثة</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardPage;
