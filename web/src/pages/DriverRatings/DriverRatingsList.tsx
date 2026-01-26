import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Rating,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StarIcon from '@mui/icons-material/Star';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetDriverRatings,
  mockHideDriverRating,
  mockDeleteDriverRating,
  DriverRating,
} from '../../services/api/driverRatings';

const DriverRatingsListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState<DriverRating | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['driver-ratings', ratingFilter, page, limit],
    queryFn: () =>
      mockGetDriverRatings({
        minRating: ratingFilter !== 'all' ? parseFloat(ratingFilter) : undefined,
        maxRating: ratingFilter !== 'all' ? parseFloat(ratingFilter) : undefined,
        page,
        limit,
      }),
  });

  const hideMutation = useMutation({
    mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) =>
      mockHideDriverRating(id, { isHidden }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-ratings'] });
      showSnackbar('تم تحديث حالة التقييم بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء تحديث التقييم', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockDeleteDriverRating(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-ratings'] });
      showSnackbar('تم حذف التقييم بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء حذف التقييم', 'error');
    },
  });

  const handleView = (rating: DriverRating) => {
    setSelectedRating(rating);
    setDetailsDialogOpen(true);
  };

  const handleHide = (rating: DriverRating) => {
    hideMutation.mutate({ id: rating.id, isHidden: !rating.isHidden });
  };

  const handleDelete = (rating: DriverRating) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      deleteMutation.mutate(rating.id);
    }
  };

  const columns = useMemo<ColumnDef<DriverRating>[]>(
    () => [
      {
        accessorKey: 'driver.name',
        header: 'السائق',
        cell: (info) => {
          const rating = info.row.original as DriverRating;
          return (
            <Typography sx={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>
              {rating.driver.name}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'customer.name',
        header: 'العميل',
        cell: (info) => {
          const rating = info.row.original as DriverRating;
          return (
            <Typography sx={{ color: '#E5E7EB', fontSize: 14 }}>
              {rating.customer.name}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'order.orderNumber',
        header: 'رقم الطلب',
        cell: (info) => {
          const rating = info.row.original as DriverRating;
          return (
            <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
              {rating.order.orderNumber}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'rating',
        header: 'التقييم',
        cell: (info) => {
          const rating = info.getValue() as number;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating value={rating} readOnly size="small" />
              <Typography sx={{ color: '#E5E7EB', fontSize: 13, ml: 0.5 }}>
                {rating.toFixed(1)}
              </Typography>
            </Box>
          );
        },
      },
      {
        accessorKey: 'comment',
        header: 'التعليق',
        cell: (info) => {
          const comment = info.getValue() as string;
          return (
            <Typography
              sx={{
                color: '#9CA3AF',
                fontSize: 13,
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {comment || '-'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'التاريخ',
        cell: (info) => {
          const value = info.getValue();
          return (
            <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
              {format(new Date(String(value)), 'dd MMM yyyy, HH:mm', { locale: ar })}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'isHidden',
        header: 'الحالة',
        cell: (info) => {
          const isHidden = info.getValue() as boolean;
          return (
            <Chip
              label={isHidden ? 'مخفي' : 'ظاهر'}
              size="small"
              sx={{
                bgcolor: isHidden ? '#F59E0B20' : '#22C55E20',
                color: isHidden ? '#F59E0B' : '#22C55E',
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

  if (isLoading) {
    return <SkeletonLoader variant="table" />;
  }

  if (!data || data.ratings.length === 0) {
    return (
      <EmptyState
        title="لا توجد تقييمات"
        description="لم يتم العثور على أي تقييمات."
        icon={<StarIcon />}
      />
    );
  }

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
            تقييمات السائقين
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }}
          >
            عرض وإدارة تقييمات السائقين من العملاء
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<AssessmentIcon />}
          onClick={() => navigate('/driver-ratings/statistics')}
          size="small"
          sx={{
            borderColor: '#2563EB',
            color: '#2563EB',
            '&:hover': {
              borderColor: '#3B82F6',
              bgcolor: '#2563EB10',
            },
          }}
        >
          الإحصائيات
        </Button>
      </Box>

      <Box
        sx={{
          mb: 2,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9CA3AF' }}>التقييم</InputLabel>
          <Select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            sx={{
              bgcolor: '#020617',
              color: '#E5E7EB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1F2937' },
            }}
            label="التقييم"
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="5">5 نجوم</MenuItem>
            <MenuItem value="4">4 نجوم</MenuItem>
            <MenuItem value="3">3 نجوم</MenuItem>
            <MenuItem value="2">2 نجوم</MenuItem>
            <MenuItem value="1">1 نجمة</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DataTable
        data={data.ratings}
        columns={columns}
        isLoading={isLoading}
        searchable={false}
        onView={handleView}
        onEdit={(rating) => handleHide(rating)}
        onDelete={handleDelete}
      />

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #1F2937',
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>تفاصيل التقييم</DialogTitle>
        <DialogContent>
          {selectedRating && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              {/* Rating */}
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  التقييم العام
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Rating value={selectedRating.rating} readOnly size="large" />
                  <Typography sx={{ color: '#E5E7EB', fontSize: 18, fontWeight: 600 }}>
                    {selectedRating.rating.toFixed(1)}
                  </Typography>
                </Box>
              </Box>

              {/* Comment */}
              {selectedRating.comment && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    التعليق
                  </Typography>
                  <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                    {selectedRating.comment}
                  </Typography>
                </Box>
              )}

              {/* Sub-ratings */}
              {(selectedRating.punctualityRating ||
                selectedRating.communicationRating ||
                selectedRating.serviceQualityRating) && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>
                    التقييمات الفرعية
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {selectedRating.punctualityRating && (
                      <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 0.5 }}>
                          الالتزام بالمواعيد
                        </Typography>
                        <Rating value={selectedRating.punctualityRating} readOnly size="small" />
                      </Box>
                    )}
                    {selectedRating.communicationRating && (
                      <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 0.5 }}>
                          التواصل
                        </Typography>
                        <Rating value={selectedRating.communicationRating} readOnly size="small" />
                      </Box>
                    )}
                    {selectedRating.serviceQualityRating && (
                      <Box>
                        <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 0.5 }}>
                          جودة الخدمة
                        </Typography>
                        <Rating
                          value={selectedRating.serviceQualityRating}
                          readOnly
                          size="small"
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Driver Info */}
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>
                  معلومات السائق
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>الاسم</Typography>
                    <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                      {selectedRating.driver.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>البريد الإلكتروني</Typography>
                    <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                      {selectedRating.driver.email}
                    </Typography>
                  </Box>
                  {selectedRating.driver.averageRating && (
                    <Box>
                      <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>
                        متوسط التقييم
                      </Typography>
                      <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                        {selectedRating.driver.averageRating.toFixed(1)} (
                        {selectedRating.driver.totalRatings} تقييم)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Customer Info */}
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>
                  معلومات العميل
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>الاسم</Typography>
                    <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                      {selectedRating.customer.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>البريد الإلكتروني</Typography>
                    <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                      {selectedRating.customer.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Order Info */}
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>
                  معلومات الطلب
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>رقم الطلب</Typography>
                    <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                      {selectedRating.order.orderNumber}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>المبلغ الإجمالي</Typography>
                    <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                      {selectedRating.order.total} ر.س
                    </Typography>
                  </Box>
                  {selectedRating.order.restaurantName && (
                    <Box>
                      <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>المطعم</Typography>
                      <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                        {selectedRating.order.restaurantName}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>تاريخ التقييم</Typography>
                    <Typography sx={{ color: '#E5E7EB', mt: 0.5 }}>
                      {format(new Date(selectedRating.createdAt), 'dd MMM yyyy, HH:mm', {
                        locale: ar,
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>إغلاق</Button>
          {selectedRating && (
            <>
              <Button
                onClick={() => {
                  handleHide(selectedRating);
                  setDetailsDialogOpen(false);
                }}
                startIcon={selectedRating.isHidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
              >
                {selectedRating.isHidden ? 'إظهار' : 'إخفاء'}
              </Button>
              <Button
                color="error"
                onClick={() => {
                  handleDelete(selectedRating);
                  setDetailsDialogOpen(false);
                }}
                startIcon={<DeleteIcon />}
              >
                حذف
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverRatingsListPage;

