import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import DateRangeIcon from '@mui/icons-material/DateRange';
import {
  mockGetSalesReport,
  mockGetRestaurantReports,
  mockGetDriverReports,
  mockGetRevenueByDay,
  mockGetRevenueByRestaurant,
  ReportFilters,
  RestaurantReport,
  DriverReport,
} from '../../services/api/reports';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import DataTable from '../../components/tables/DataTable';

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#38BDF8'];

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'sales' | 'restaurants' | 'drivers'>('sales');
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: salesReport, isLoading: salesLoading } = useQuery({
    queryKey: ['reports', 'sales', filters],
    queryFn: () => mockGetSalesReport(filters),
  });

  const { data: restaurantReports, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['reports', 'restaurants', filters],
    queryFn: () => mockGetRestaurantReports(filters),
  });

  const { data: driverReports, isLoading: driversLoading } = useQuery({
    queryKey: ['reports', 'drivers', filters],
    queryFn: () => mockGetDriverReports(filters),
  });

  const { data: revenueByDay, isLoading: revenueByDayLoading } = useQuery({
    queryKey: ['reports', 'revenue-by-day', filters],
    queryFn: () => mockGetRevenueByDay(filters),
  });

  const { data: revenueByRestaurant, isLoading: revenueByRestaurantLoading } = useQuery({
    queryKey: ['reports', 'revenue-by-restaurant', filters],
    queryFn: () => mockGetRevenueByRestaurant(filters),
  });

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Restaurant columns
  const restaurantColumns = useMemo<ColumnDef<RestaurantReport>[]>(
    () => [
      {
        accessorKey: 'restaurantName',
        header: 'اسم المطعم',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'totalOrders',
        header: 'إجمالي الطلبات',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'totalRevenue',
        header: 'إجمالي الإيرادات',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14, fontWeight: 500 }}>
            {String(info.getValue())} ر.س
          </Typography>
        ),
      },
      {
        accessorKey: 'averageOrderValue',
        header: 'متوسط قيمة الطلب',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())} ر.س
          </Typography>
        ),
      },
      {
        accessorKey: 'completionRate',
        header: 'معدل الإتمام',
        cell: (info) => {
          const rate = Number(info.getValue()) * 100;
          return (
            <Chip
              label={`${rate.toFixed(1)}%`}
              size="small"
              sx={{
                bgcolor:
                  rate >= 90 ? '#22C55E20' : rate >= 80 ? '#F59E0B20' : '#EF444420',
                color: rate >= 90 ? '#22C55E' : rate >= 80 ? '#F59E0B' : '#EF4444',
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          );
        },
      },
    ],
    []
  );

  // Driver columns
  const driverColumns = useMemo<ColumnDef<DriverReport>[]>(
    () => [
      {
        accessorKey: 'driverName',
        header: 'اسم السائق',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'totalDeliveries',
        header: 'إجمالي التوصيلات',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'completedDeliveries',
        header: 'المكتملة',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'averageDeliveryTime',
        header: 'متوسط وقت التوصيل',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
            {String(info.getValue())} دقيقة
          </Typography>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'التقييم',
        cell: (info) => {
          const rating = Number(info.getValue());
          return (
            <Chip
              label={`⭐ ${rating.toFixed(1)}`}
              size="small"
              sx={{
                bgcolor:
                  rating >= 4.5
                    ? '#22C55E20'
                    : rating >= 4.0
                    ? '#F59E0B20'
                    : '#EF444420',
                color:
                  rating >= 4.5 ? '#22C55E' : rating >= 4.0 ? '#F59E0B' : '#EF4444',
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'totalEarnings',
        header: 'إجمالي الأرباح',
        cell: (info) => (
          <Typography sx={{ color: '#E5E7EB', fontSize: 14, fontWeight: 500 }}>
            {String(info.getValue())} ر.س
          </Typography>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ color: '#E5E7EB' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            التقارير والتحليلات
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            تقارير مفصلة عن المبيعات، المطاعم، والسائقين
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant={reportType === 'sales' ? 'contained' : 'outlined'}
            onClick={() => setReportType('sales')}
          >
            تقرير المبيعات
          </Button>
          <Button
            variant={reportType === 'restaurants' ? 'contained' : 'outlined'}
            onClick={() => setReportType('restaurants')}
          >
            تقرير المطاعم
          </Button>
          <Button
            variant={reportType === 'drivers' ? 'contained' : 'outlined'}
            onClick={() => setReportType('drivers')}
          >
            تقرير السائقين
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <DateRangeIcon sx={{ color: '#9CA3AF' }} />
          <TextField
            label="من تاريخ"
            type="date"
            size="small"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#020617',
                '& fieldset': { borderColor: '#1F2937' },
                '&:hover fieldset': { borderColor: '#374151' },
              },
              input: { color: '#E5E7EB' },
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
            }}
          />
          <TextField
            label="إلى تاريخ"
            type="date"
            size="small"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#020617',
                '& fieldset': { borderColor: '#1F2937' },
                '&:hover fieldset': { borderColor: '#374151' },
              },
              input: { color: '#E5E7EB' },
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
            }}
          />
        </Box>
      </Paper>

      {/* Sales Report */}
      {reportType === 'sales' && (
        <>
          {salesLoading ? (
            <SkeletonLoader variant="cards" count={2} />
          ) : salesReport ? (
            <>
              {/* Summary Cards */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(3, minmax(0, 1fr))',
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    إجمالي الطلبات
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {salesReport.totalOrders.toLocaleString()}
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    إجمالي الإيرادات
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {salesReport.totalRevenue.toLocaleString()} ر.س
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    متوسط قيمة الطلب
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {salesReport.averageOrderValue.toLocaleString()} ر.س
                  </Typography>
                </Paper>
              </Box>

              {/* Charts */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    md: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                {/* Revenue by Day */}
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
                    الإيرادات حسب اليوم
                  </Typography>
                  {revenueByDayLoading ? (
                    <SkeletonLoader variant="chart" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueByDay || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                        <XAxis
                          dataKey="date"
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111827',
                            border: '1px solid #1F2937',
                            borderRadius: 8,
                            color: '#E5E7EB',
                          }}
                        />
                        <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#2563EB"
                          strokeWidth={2}
                          name="الإيرادات (ر.س)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Paper>

                {/* Orders by Status */}
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
                    الطلبات حسب الحالة
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={salesReport.ordersByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => {
                          const { index, percent } = props;
                          const item = salesReport.ordersByStatus[index ?? 0];
                          const pct = percent ?? 0;
                          return `${item?.status}: ${(pct * 100).toFixed(0)}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {salesReport.ordersByStatus.map((entry, index) => (
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
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>

              {/* Revenue by Restaurant */}
              <Paper
                sx={{
                  bgcolor: '#111827',
                  borderRadius: 2,
                  border: '1px solid #1F2937',
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
                  الإيرادات حسب المطعم
                </Typography>
                {revenueByRestaurantLoading ? (
                  <SkeletonLoader variant="chart" />
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={revenueByRestaurant || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                      <XAxis
                        dataKey="restaurantName"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          border: '1px solid #1F2937',
                          borderRadius: 8,
                          color: '#E5E7EB',
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                      <Bar dataKey="revenue" fill="#2563EB" name="الإيرادات (ر.س)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </>
          ) : null}
        </>
      )}

      {/* Restaurants Report */}
      {reportType === 'restaurants' && (
        <>
          {restaurantsLoading ? (
            <SkeletonLoader variant="table" count={5} />
          ) : restaurantReports ? (
            <>
              {/* Summary Cards */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    إجمالي المطاعم
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {restaurantReports.length}
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    إجمالي الطلبات
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {restaurantReports.reduce((sum, r) => sum + r.totalOrders, 0).toLocaleString()}
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    إجمالي الإيرادات
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {restaurantReports
                      .reduce((sum, r) => sum + r.totalRevenue, 0)
                      .toLocaleString()}{' '}
                    ر.س
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    متوسط معدل الإتمام
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {(
                      (restaurantReports.reduce((sum, r) => sum + r.completionRate, 0) /
                        restaurantReports.length) *
                      100
                    ).toFixed(1)}
                    %
                  </Typography>
                </Paper>
              </Box>

              {/* Chart: Revenue by Restaurant */}
              <Paper
                sx={{
                  bgcolor: '#111827',
                  borderRadius: 2,
                  border: '1px solid #1F2937',
                  p: 3,
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
                  الإيرادات حسب المطعم
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={restaurantReports}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis
                      dataKey="restaurantName"
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #1F2937',
                        borderRadius: 8,
                        color: '#E5E7EB',
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                    <Bar dataKey="totalRevenue" fill="#2563EB" name="الإيرادات (ر.س)" />
                    <Bar dataKey="totalOrders" fill="#22C55E" name="عدد الطلبات" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              {/* Table */}
              <Paper
                sx={{
                  bgcolor: '#111827',
                  borderRadius: 2,
                  border: '1px solid #1F2937',
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
                  جدول تفصيلي للمطاعم
                </Typography>
                <DataTable
                  data={restaurantReports}
                  columns={restaurantColumns}
                  searchable={true}
                  searchPlaceholder="ابحث عن مطعم..."
                />
              </Paper>
            </>
          ) : null}
        </>
      )}

      {/* Drivers Report */}
      {reportType === 'drivers' && (
        <>
          {driversLoading ? (
            <SkeletonLoader variant="table" count={5} />
          ) : driverReports ? (
            <>
              {/* Summary Cards */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    إجمالي السائقين
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {driverReports.length}
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    إجمالي التوصيلات
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {driverReports.reduce((sum, d) => sum + d.totalDeliveries, 0).toLocaleString()}
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    معدل الإتمام
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {(
                      (driverReports.reduce((sum, d) => sum + d.completedDeliveries, 0) /
                        driverReports.reduce((sum, d) => sum + d.totalDeliveries, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </Typography>
                </Paper>
                <Paper
                  sx={{
                    bgcolor: '#111827',
                    borderRadius: 2,
                    border: '1px solid #1F2937',
                    p: 3,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
                    متوسط وقت التوصيل
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#E5E7EB', fontWeight: 700 }}>
                    {Math.round(
                      driverReports.reduce((sum, d) => sum + d.averageDeliveryTime, 0) /
                        driverReports.length
                    )}{' '}
                    دقيقة
                  </Typography>
                </Paper>
              </Box>

              {/* Chart: Deliveries by Driver */}
              <Paper
                sx={{
                  bgcolor: '#111827',
                  borderRadius: 2,
                  border: '1px solid #1F2937',
                  p: 3,
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
                  التوصيلات حسب السائق
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={driverReports.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis
                      dataKey="driverName"
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #1F2937',
                        borderRadius: 8,
                        color: '#E5E7EB',
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                    <Bar dataKey="totalDeliveries" fill="#2563EB" name="إجمالي التوصيلات" />
                    <Bar dataKey="completedDeliveries" fill="#22C55E" name="المكتملة" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              {/* Chart: Ratings */}
              <Paper
                sx={{
                  bgcolor: '#111827',
                  borderRadius: 2,
                  border: '1px solid #1F2937',
                  p: 3,
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 2, fontWeight: 600 }}>
                  التقييمات حسب السائق
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={driverReports.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis
                      dataKey="driverName"
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      domain={[0, 5]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #1F2937',
                        borderRadius: 8,
                        color: '#E5E7EB',
                      }}
                    />
                    <Bar dataKey="rating" fill="#F59E0B" name="التقييم" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              {/* Table */}
              <Paper
                sx={{
                  bgcolor: '#111827',
                  borderRadius: 2,
                  border: '1px solid #1F2937',
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 3, fontWeight: 600 }}>
                  جدول تفصيلي للسائقين
                </Typography>
                <DataTable
                  data={driverReports}
                  columns={driverColumns}
                  searchable={true}
                  searchPlaceholder="ابحث عن سائق..."
                />
              </Paper>
            </>
          ) : null}
        </>
      )}
    </Box>
  );
};

export default ReportsPage;

