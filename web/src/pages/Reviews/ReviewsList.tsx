import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Button,
  Avatar,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  getReviews,
  deleteReview,
  setReviewHidden,
  clearReviewsUnavailableCache,
  Review,
} from '../../services/api/reviews';
import { format, isValid } from 'date-fns';
import { ar } from 'date-fns/locale';
import ApiDataSourceBanner from '../../components/common/ApiDataSourceBanner';
import { getApiDataSource } from '../../services/api/base';

const formatReviewDate = (value: string) => {
  const d = new Date(value);
  return isValid(d) ? format(d, 'dd MMM yyyy', { locale: ar }) : value || '—';
};

const TARGET_LABELS: Record<string, string> = {
  restaurant: 'مطعم',
  rider: 'سائق',
  all: 'الكل',
};

const ReviewsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [page] = useState(1);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['reviews', targetTypeFilter, ratingFilter, searchQuery, page],
    queryFn: () =>
      getReviews({
        targetType: targetTypeFilter === 'all' ? undefined : targetTypeFilter,
        rating: ratingFilter === '0' ? undefined : parseInt(ratingFilter, 10),
        search: searchQuery || undefined,
        page,
        limit: 10,
      }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleRefreshReviews = () => {
    clearReviewsUnavailableCache();
    refetch();
  };

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      showSnackbar('تم حذف التقييم', 'success');
    },
    onError: (err: Error) => showSnackbar(err.message || 'فشل الحذف', 'error'),
  });

  const hideMutation = useMutation({
    mutationFn: ({ id, hidden }: { id: string; hidden: boolean }) => setReviewHidden(id, hidden),
    onSuccess: (_, { hidden }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      showSnackbar(hidden ? 'تم إخفاء التقييم' : 'تم إظهار التقييم', 'success');
    },
    onError: (err: Error) => showSnackbar(err.message || 'فشل التحديث', 'error'),
  });

  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      {
        accessorKey: 'userName',
        header: 'المستخدم',
        cell: ({ row, getValue }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={row.original.userImage ?? undefined}
              sx={{ width: 28, height: 28, fontSize: 12 }}
            >
              {String(getValue()).charAt(0)}
            </Avatar>
            <Typography
              sx={{
                color: row.original.hidden ? '#9CA3AF' : '#1A2E1A',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: row.original.hidden ? 'line-through' : 'none',
              }}
            >
              {String(getValue())}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'targetType',
        header: 'النوع',
        cell: (info) => (
          <Chip
            label={TARGET_LABELS[String(info.getValue())] || String(info.getValue())}
            size="small"
            sx={{
              bgcolor: (info.getValue() as string) === 'restaurant' ? 'rgba(134,181,115,0.2)' : 'rgba(59,130,246,0.2)',
              color: (info.getValue() as string) === 'restaurant' ? '#86B573' : '#3B82F6',
              fontSize: 12,
            }}
          />
        ),
      },
      {
        accessorKey: 'targetName',
        header: 'الهدف',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'التقييم',
        cell: (info) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
            <Typography sx={{ color: '#1A2E1A', fontWeight: 600 }}>
              {Number(info.getValue())}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'comment',
        header: 'التعليق',
        cell: (info) => (
          <Typography
            sx={{
              color: '#5A6A5A',
              fontSize: 13,
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {String(info.getValue() || '')}
          </Typography>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'التاريخ',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {formatReviewDate(String(info.getValue()))}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              title={row.original.hidden ? 'إظهار التقييم' : 'إخفاء التقييم'}
              onClick={() =>
                hideMutation.mutate({
                  id: row.original.id,
                  hidden: !row.original.hidden,
                })
              }
              disabled={hideMutation.isPending}
              sx={{ color: row.original.hidden ? '#86B573' : '#5A6A5A' }}
            >
              {row.original.hidden ? (
                <VisibilityIcon fontSize="small" />
              ) : (
                <VisibilityOffIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                if (window.confirm('هل تريد حذف هذا التقييم نهائياً؟')) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
              disabled={deleteMutation.isPending}
              sx={{ color: '#EF4444' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [deleteMutation, hideMutation]
  );

  if (isLoading) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  const reviews = data?.reviews ?? [];

  return (
    <Box sx={{ color: '#1A2E1A' }}>
      <ApiDataSourceBanner />
      {(data?.notice || data?.apiUnavailable) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {data.notice}
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            الباكند أصلح <code>GET /admin/reviews</code> (2026-05-21 — flutter-reviews-api.md). اضغط{' '}
            <strong>إعادة المحاولة</strong> أدناه. تقييمات التطبيق:{' '}
            <code>/restaurants/&#123;id&#125;/reviews</code> و <code>/riders/&#123;id&#125;/reviews</code>.
          </Typography>
        </Alert>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          فشل تحميل التقييمات: {(error as Error).message}
        </Alert>
      )}
      {getApiDataSource() === 'real' && !isLoading && !isError && !data?.apiUnavailable && reviews.length === 0 && !data?.notice && (
        <Alert severity="info" sx={{ mb: 2 }}>
          السيرفر رجّع قائمة فارغة من <code>GET /admin/reviews</code>. إن كان في تقييمات في
          التطبيق ولا تظهر هنا، تأكد أن الباكند يملأ جدول المراجعات ويربط الـ endpoint. افتح
          Console وابحث عن <code>[Reviews API]</code> لرؤية الاستجابة الخام.
        </Alert>
      )}
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
            التقييمات
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A', fontSize: { xs: 12, sm: 14 } }}>
            إدارة تقييمات المطاعم والسائقين — قائمة الأدمن: <code>GET /admin/reviews</code>
          </Typography>
          {data?.dataSource && data.dataSource !== 'admin/reviews' && (
            <Typography variant="caption" sx={{ color: '#D97706', display: 'block', mt: 0.5 }}>
              مصدر البيانات: {data.dataSource}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshReviews}
          disabled={isFetching}
        >
          إعادة المحاولة
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            placeholder="بحث..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#5A6A5A' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#B1C0B1' },
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>النوع</InputLabel>
            <Select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              label="النوع"
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B1C0B1' },
              }}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="restaurant">مطعم</MenuItem>
              <MenuItem value="rider">سائق</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>التقييم</InputLabel>
            <Select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              label="التقييم"
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B1C0B1' },
              }}
            >
              <MenuItem value="0">الكل</MenuItem>
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="3">3</MenuItem>
              <MenuItem value="4">4</MenuItem>
              <MenuItem value="5">5</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {reviews.length === 0 ? (
        <EmptyState
          title={data?.apiUnavailable ? 'التقييمات غير متاحة من السيرفر' : 'لا توجد تقييمات'}
          description={
            data?.apiUnavailable
              ? 'الـ API معطّل حالياً. Dashboard يعمل — المشكلة في endpoint التقييمات فقط.'
              : 'لم يتم العثور على تقييمات مطابقة للبحث أو الفلاتر.'
          }
        />
      ) : (
        <DataTable data={reviews} columns={columns} searchable={false} isLoading={isLoading} />
      )}
    </Box>
  );
};

export default ReviewsListPage;
