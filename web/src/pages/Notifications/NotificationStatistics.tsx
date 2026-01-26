import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import StatCard from '../../components/common/StatCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { mockGetNotificationStatistics, mockGetNotifications } from '../../services/api/notifications';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const NotificationStatisticsPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['notifications', 'statistics'],
    queryFn: () => mockGetNotificationStatistics(),
  });

  const { data: recentNotificationsData, isLoading: recentLoading } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => mockGetNotifications({ limit: 20, page: 1 }),
  });

  if (statsLoading || recentLoading) {
    return <SkeletonLoader variant="chart" />;
  }

  if (!stats) {
    return null;
  }

  // Prepare data for charts
  const notificationsByTypeData = [
    { name: 'معلومات', value: stats.byType.info, color: '#38BDF8' },
    { name: 'عرض ترويجي', value: stats.byType.promotion, color: '#2563EB' },
    { name: 'تحذير', value: stats.byType.warning, color: '#F59E0B' },
    { name: 'نجاح', value: stats.byType.success, color: '#22C55E' },
    { name: 'خطأ', value: stats.byType.error, color: '#EF4444' },
  ].filter((item) => item.value > 0);

  const notificationsByAudienceData = [
    { name: 'جميع المستخدمين', value: stats.byAudience.all, color: '#2563EB' },
    { name: 'العملاء', value: stats.byAudience.customers, color: '#22C55E' },
    { name: 'السائقون', value: stats.byAudience.drivers, color: '#38BDF8' },
    { name: 'المطاعم', value: stats.byAudience.restaurants, color: '#F59E0B' },
    { name: 'محددون', value: stats.byAudience.specific, color: '#9CA3AF' },
  ].filter((item) => item.value > 0);

  // Mock data for notifications over time (in real app, this would come from API)
  const notificationsOverTimeData = [
    { date: 'يناير', sent: 800, delivered: 760 },
    { date: 'فبراير', sent: 950, delivered: 900 },
    { date: 'مارس', sent: 1100, delivered: 1045 },
    { date: 'أبريل', sent: 1200, delivered: 1140 },
    { date: 'مايو', sent: 1300, delivered: 1235 },
    { date: 'يونيو', sent: 1400, delivered: 1330 },
  ];

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
            إحصائيات الإشعارات
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            نظرة شاملة على الإشعارات المرسلة ومعدلات التسليم
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
          title="إجمالي الإشعارات المرسلة"
          value={stats.totalSent.toLocaleString()}
          icon={<NotificationsIcon />}
        />
        <StatCard
          title="إجمالي المسلمة"
          value={stats.totalDelivered.toLocaleString()}
          icon={<CheckCircleIcon />}
        />
        <StatCard
          title="معدل التسليم"
          value={`${stats.deliveryRate.toFixed(1)}%`}
          icon={<TrendingUpIcon />}
        />
        <StatCard
          title="الإشعارات الأخيرة"
          value={stats.recentNotifications.length}
          icon={<PeopleIcon />}
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
        {/* Notifications by Type Pie Chart */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
            توزيع الإشعارات حسب النوع
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={notificationsByTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {notificationsByTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Notifications by Audience Bar Chart */}
        <Paper
          sx={{
            bgcolor: '#111827',
            borderRadius: 2,
            border: '1px solid #1F2937',
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
            توزيع الإشعارات حسب الجمهور
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={notificationsByAudienceData}>
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
              <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Notifications Over Time Line Chart */}
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
            الإشعارات عبر الزمن
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={notificationsOverTimeData}>
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
                dataKey="sent"
                stroke="#2563EB"
                strokeWidth={2}
                name="مرسلة"
                dot={{ fill: '#2563EB', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="delivered"
                stroke="#22C55E"
                strokeWidth={2}
                name="مسلمة"
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
          ملخص الأداء
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
              معدل التسليم
            </Typography>
            <Typography sx={{ color: '#E5E7EB', fontSize: 20, fontWeight: 700 }}>
              {stats.deliveryRate.toFixed(1)}%
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
              الإشعارات الفاشلة
            </Typography>
            <Typography sx={{ color: '#EF4444', fontSize: 20, fontWeight: 700 }}>
              {stats.totalSent - stats.totalDelivered}
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
              متوسط الإشعارات/شهر
            </Typography>
            <Typography sx={{ color: '#E5E7EB', fontSize: 20, fontWeight: 700 }}>
              {Math.floor(stats.totalSent / 6).toLocaleString()}
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
              أكثر نوع استخداماً
            </Typography>
            <Typography sx={{ color: '#E5E7EB', fontSize: 20, fontWeight: 700 }}>
              {Object.entries(stats.byType)
                .sort(([, a], [, b]) => b - a)[0]?.[0] === 'info'
                ? 'معلومات'
                : Object.entries(stats.byType).sort(([, a], [, b]) => b - a)[0]?.[0] ===
                  'promotion'
                ? 'عرض ترويجي'
                : 'تحذير'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotificationStatisticsPage;

