import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  mockGetBanners,
  Banner,
  BannerType,
  getBannerTypeLabel,
  getUserSegmentLabel,
} from '../../services/api/banners';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const BannersListPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<BannerType | 'all'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['banners', activeFilter, typeFilter],
    queryFn: () =>
      mockGetBanners({
        is_active:
          activeFilter === 'all'
            ? undefined
            : activeFilter === 'active',
        banner_type: typeFilter === 'all' ? undefined : typeFilter,
      }),
  });

  const columns = useMemo<ColumnDef<Banner>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'العنوان',
        cell: (info) => (
          <Typography sx={{ color: '#1A2E1A', fontWeight: 600, fontSize: 14 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'description',
        header: 'الوصف',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }} noWrap>
            {String(info.getValue() || '-')}
          </Typography>
        ),
      },
      {
        accessorKey: 'banner_type',
        header: 'النوع',
        cell: (info) => (
          <Chip
            label={getBannerTypeLabel(info.getValue() as BannerType)}
            size="small"
            sx={{
              bgcolor: 'rgba(134, 181, 115, 0.2)',
              color: '#86B573',
              fontSize: 12,
            }}
          />
        ),
      },
      {
        accessorKey: 'user_segment',
        header: 'شريحة المستخدم',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {getUserSegmentLabel(info.getValue() as any)}
          </Typography>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'الحالة',
        cell: (info) => (
          <Chip
            label={info.getValue() ? 'نشط' : 'غير نشط'}
            size="small"
            sx={{
              bgcolor: info.getValue()
                ? 'rgba(34, 197, 94, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
              color: info.getValue() ? '#22C55E' : '#EF4444',
              fontSize: 12,
            }}
          />
        ),
      },
      {
        accessorKey: 'end_date',
        header: 'ينتهي في',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {info.getValue()
              ? format(new Date(String(info.getValue())), 'dd MMM yyyy', { locale: ar })
              : '-'}
          </Typography>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  const banners = data || [];

  return (
    <Box sx={{ color: '#1A2E1A' }}>
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
          <Typography variant="h5" fontWeight={700} mb={0.5} sx={{ fontSize: { xs: 20, sm: 24 } }}>
            البانرات
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A', fontSize: { xs: 12, sm: 14 } }}>
            إدارة البانرات والحملات الترويجية
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              label="الحالة"
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B1C0B1' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#86B573' },
              }}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="inactive">غير نشط</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>نوع البانر</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as BannerType | 'all')}
              label="نوع البانر"
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B1C0B1' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#86B573' },
              }}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="restaurant_promo">عرض مطعم</MenuItem>
              <MenuItem value="platform_offer">عرض المنصة</MenuItem>
              <MenuItem value="campaign">حملة</MenuItem>
              <MenuItem value="custom">مخصص</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {banners.length === 0 ? (
        <EmptyState
          title="لا توجد بانرات"
          description="لم يتم العثور على بانرات تطابق الفلاتر المحددة."
        />
      ) : (
        <DataTable
          data={banners}
          columns={columns}
          searchable={false}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
};

export default BannersListPage;
