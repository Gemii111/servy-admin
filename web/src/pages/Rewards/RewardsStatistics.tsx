import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StatCard from '../../components/common/StatCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { mockGetRewardsStatistics, mockGetUserRewardsHistory } from '../../services/api/rewards';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const RewardsStatisticsPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['rewards', 'statistics'],
    queryFn: () => mockGetRewardsStatistics(),
  });

  const { data: recentRewardsData, isLoading: recentLoading } = useQuery({
    queryKey: ['user-rewards', 'recent'],
    queryFn: () => mockGetUserRewardsHistory({ limit: 20, page: 1 }),
  });

  if (statsLoading || recentLoading) {
    return <SkeletonLoader variant="chart" />;
  }

  if (!stats) {
    return null;
  }

  // Prepare data for charts
  const rewardsByTypeData = [
    { name: 'رصيد نقدي', value: stats.byType.cash_credit, color: '#22C55E' },
    { name: 'كوبون خصم', value: stats.byType.discount_coupon, color: '#2563EB' },
    { name: 'توصيل مجاني', value: stats.byType.free_delivery, color: '#38BDF8' },
    { name: 'عنصر مجاني', value: stats.byType.free_item, color: '#F59E0B' },
    { name: 'نقاط', value: stats.byType.points, color: '#F97316' },
    { name: 'مخصص', value: stats.byType.custom, color: '#9CA3AF' },
  ].filter((item) => item.value > 0);

  // Mock data for rewards over time (in real app, this would come from API)
  const rewardsOverTimeData = [
    { date: 'يناير', assigned: 120, used: 80 },
    { date: 'فبراير', assigned: 150, used: 100 },
    { date: 'مارس', assigned: 180, used: 120 },
    { date: 'أبريل', assigned: 200, used: 140 },
    { date: 'مايو', assigned: 220, used: 160 },
    { date: 'يونيو', assigned: 250, used: 180 },
  ];

  // Top rewards by usage
  const topRewardsData = recentRewardsData?.userRewards
    .reduce((acc: any[], reward) => {
      const existing = acc.find((r) => r.rewardId === reward.rewardId);
      if (existing) {
        existing.used += reward.status === 'used' ? 1 : 0;
        existing.total += 1;
      } else {
        acc.push({
          rewardId: reward.rewardId,
          rewardName: reward.reward.name,
          used: reward.status === 'used' ? 1 : 0,
          total: 1,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.used - a.used)
    .slice(0, 10)
    .map((r) => ({
      name: r.rewardName.length > 15 ? r.rewardName.substring(0, 15) + '...' : r.rewardName,
      used: r.used,
      total: r.total,
    })) || [];

  return (
    <Box sx={{ color: '#E5E7EB' }}>
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            mb={0.5}
            sx={{ fontSize: { xs: 20, sm: 24 } }}
          >
            إحصائيات الجوائز
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            نظرة شاملة على الجوائز والاستخدام
          </Typography>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          columnGap: 2,
          rowGap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="إجمالي الجوائز"
          value={stats.totalRewards}
          icon={<CardGiftcardIcon />}
        />
        <StatCard
          title="إجمالي الممنوحة"
          value={stats.totalAssigned}
          icon={<TrendingUpIcon />}
        />
        <StatCard
          title="إجمالي المستخدمة"
          value={stats.totalUsed}
          icon={<CheckCircleIcon />}
        />
        <StatCard
          title="معدل الاستخدام"
          value={`${stats.usageRate.toFixed(1)}%`}
          icon={<AttachMoneyIcon />}
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
          columnGap: 2,
          rowGap: 2,
          mb: 3,
        }}
      >
        {/* Rewards by Type Pie Chart */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
            توزيع الجوائز حسب النوع
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rewardsByTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {rewardsByTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Top Rewards Bar Chart */}
        {topRewardsData.length > 0 && (
          <Paper
            sx={{
              bgcolor: '#111827',
              borderRadius: 2,
              border: '1px solid #1F2937',
              p: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
              أفضل الجوائز استخداماً
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topRewardsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #1F2937',
                    borderRadius: 8,
                    color: '#E5E7EB',
                  }}
                />
                <Bar dataKey="used" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}

        {/* Rewards Over Time Line Chart */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 3,
            gridColumn: { xs: '1', md: '1 / -1' },
          }}
        >
          <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
            الجوائز عبر الزمن
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rewardsOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #1F2937',
                  borderRadius: 8,
                  color: '#E5E7EB',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="assigned"
                stroke="#2563EB"
                strokeWidth={2}
                name="ممنوحة"
                dot={{ fill: '#2563EB', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="used"
                stroke="#22C55E"
                strokeWidth={2}
                name="مستخدمة"
                dot={{ fill: '#22C55E', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Summary Box */}
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
          ملخص القيمة
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: '#020617',
              borderRadius: 1,
              border: '1px solid #1F2937',
            }}
          >
            <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 0.5 }}>
              إجمالي القيمة الموزعة
            </Typography>
            <Typography sx={{ color: '#E5E7EB', fontSize: 20, fontWeight: 700 }}>
              {stats.totalValue.toLocaleString()} ر.س
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              bgcolor: '#020617',
              borderRadius: 1,
              border: '1px solid #1F2937',
            }}
          >
            <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 0.5 }}>
              متوسط قيمة الجائزة
            </Typography>
            <Typography sx={{ color: '#E5E7EB', fontSize: 20, fontWeight: 700 }}>
              {stats.totalAssigned > 0
                ? (stats.totalValue / stats.totalAssigned).toFixed(2)
                : '0'}{' '}
              ر.س
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              bgcolor: '#020617',
              borderRadius: 1,
              border: '1px solid #1F2937',
            }}
          >
            <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 0.5 }}>
              معدل الاستخدام
            </Typography>
            <Typography sx={{ color: '#E5E7EB', fontSize: 20, fontWeight: 700 }}>
              {stats.usageRate.toFixed(1)}%
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              bgcolor: '#020617',
              borderRadius: 1,
              border: '1px solid #1F2937',
            }}
          >
            <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 0.5 }}>
              الجوائز النشطة
            </Typography>
            <Typography sx={{ color: '#E5E7EB', fontSize: 20, fontWeight: 700 }}>
              {stats.totalRewards}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RewardsStatisticsPage;

