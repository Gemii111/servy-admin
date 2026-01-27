import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StatCard from '../../components/common/StatCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import {
  mockGetDriverRatingsStatistics,
  mockGetDriverRatings,
} from '../../services/api/driverRatings';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const DriverRatingsStatisticsPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['driver-ratings', 'statistics'],
    queryFn: () => mockGetDriverRatingsStatistics(),
  });

  const { data: recentRatingsData, isLoading: recentLoading } = useQuery({
    queryKey: ['driver-ratings', 'recent'],
    queryFn: () => mockGetDriverRatings({ limit: 10, sortBy: 'created_at', sortOrder: 'desc' }),
  });

  if (statsLoading || recentLoading) {
    return <SkeletonLoader variant="chart" />;
  }

  if (!stats) {
    return null;
  }

  // Prepare data for charts
  const ratingDistributionData = [
    { name: '5 نجوم', value: stats.ratingDistribution['5'], color: '#22C55E' },
    { name: '4 نجوم', value: stats.ratingDistribution['4'], color: '#38BDF8' },
    { name: '3 نجوم', value: stats.ratingDistribution['3'], color: '#F59E0B' },
    { name: '2 نجوم', value: stats.ratingDistribution['2'], color: '#F97316' },
    { name: '1 نجمة', value: stats.ratingDistribution['1'], color: '#EF4444' },
  ];

  const topDriversData = stats.topDrivers.slice(0, 10).map((driver) => ({
    name: driver.driverName.length > 15 ? driver.driverName.substring(0, 15) + '...' : driver.driverName,
    rating: driver.averageRating,
    totalRatings: driver.totalRatings,
  }));

  const recentRatingsChartData = recentRatingsData?.ratings.slice(0, 7).reverse().map((rating) => ({
    date: new Date(rating.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
    rating: rating.rating,
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
            إحصائيات تقييمات السائقين
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            نظرة شاملة على تقييمات السائقين والأداء
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
          title="إجمالي التقييمات"
          value={stats.totalRatings}
          icon={<AssessmentIcon />}
        />
        <StatCard
          title="متوسط التقييم"
          value={stats.averageRating.toFixed(1)}
          icon={<StarIcon />}
        />
        <StatCard
          title="أفضل سائق"
          value={
            stats.topDrivers.length > 0
              ? `${stats.topDrivers[0].driverName} (${stats.topDrivers[0].averageRating.toFixed(1)})`
              : '-'
          }
          icon={<TrendingUpIcon />}
        />
        <StatCard
          title="عدد السائقين"
          value={stats.topDrivers.length + stats.lowestDrivers.length}
          icon={<PersonIcon />}
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
        {/* Rating Distribution Pie Chart */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
            توزيع التقييمات
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ratingDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {ratingDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Top Drivers Bar Chart */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
            أفضل 10 سائقين
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topDriversData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 5]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #1F2937',
                  borderRadius: 8,
                  color: '#E5E7EB',
                }}
              />
              <Bar dataKey="rating" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Recent Ratings Line Chart */}
        {recentRatingsChartData.length > 0 && (
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
              التقييمات الأخيرة
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recentRatingsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 5]} />
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
                  dataKey="rating"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ fill: '#2563EB', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        )}
      </Box>

      {/* Top & Lowest Drivers Tables */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            md: 'repeat(2, minmax(0, 1fr))',
          },
          columnGap: 2,
          rowGap: 2,
        }}
      >
        {/* Top Drivers */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
            أفضل السائقين
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {stats.topDrivers.slice(0, 5).map((driver, index) => (
              <Box
                key={driver.driverId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  bgcolor: '#020617',
                  borderRadius: 1,
                  border: '1px solid #1F2937',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#2563EB20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#E5E7EB', fontSize: 14, fontWeight: 500 }}>
                      {driver.driverName}
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
                      {driver.totalRatings} تقييم
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                  <Typography sx={{ color: '#E5E7EB', fontSize: 16, fontWeight: 600 }}>
                    {driver.averageRating.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Lowest Drivers */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
            السائقين الأقل تقييماً
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {stats.lowestDrivers.slice(0, 5).map((driver, index) => (
              <Box
                key={driver.driverId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  bgcolor: '#020617',
                  borderRadius: 1,
                  border: '1px solid #1F2937',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#EF444420',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EF4444',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#E5E7EB', fontSize: 14, fontWeight: 500 }}>
                      {driver.driverName}
                    </Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
                      {driver.totalRatings} تقييم
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                  <Typography sx={{ color: '#E5E7EB', fontSize: 16, fontWeight: 600 }}>
                    {driver.averageRating.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default DriverRatingsStatisticsPage;

