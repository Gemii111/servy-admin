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
  Button,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  getRiders,
  updateRiderStatus,
  Rider,
  getRiderStatusLabel,
  getVehicleLabel,
} from '../../services/api/riders';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

const RidersListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['riders', statusFilter, vehicleTypeFilter, searchQuery],
    queryFn: () =>
      getRiders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        vehicleType: vehicleTypeFilter === 'all' ? undefined : vehicleTypeFilter,
        search: searchQuery || undefined,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateRiderStatus(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      showSnackbar('تم تحديث حالة السائق', 'success');
    },
    onError: (err: Error) => showSnackbar(err.message || 'فشل تحديث الحالة', 'error'),
  });

  const statusColors: Record<string, string> = {
    available: '#22C55E',
    heading_to_restaurant: '#3B82F6',
    at_restaurant: '#8B5CF6',
    delivering: '#F59E0B',
    offline: '#5A6A5A',
  };

  const columns = useMemo<ColumnDef<Rider>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'الاسم',
        cell: ({ row }) => (
          <Typography sx={{ color: '#1A2E1A', fontWeight: 600, fontSize: 14 }}>
            {row.original.name}
          </Typography>
        ),
      },
      {
        accessorKey: 'email',
        header: 'البريد الإلكتروني',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {String(info.getValue() || '')}
          </Typography>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'الهاتف',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'vehicleType',
        header: 'نوع المركبة',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {getVehicleLabel(String(info.getValue()))}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: (info) => {
          const status = String(info.getValue());
          return (
            <Chip
              label={getRiderStatusLabel(status)}
              size="small"
              sx={{
                bgcolor: `${statusColors[status] || '#5A6A5A'}20`,
                color: statusColors[status] || '#5A6A5A',
                fontSize: 12,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'نشط',
        cell: (info) => (
          <Chip
            label={info.getValue() ? 'نعم' : 'لا'}
            size="small"
            sx={{
              bgcolor: info.getValue() ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: info.getValue() ? '#22C55E' : '#EF4444',
              fontSize: 12,
            }}
          />
        ),
      },
      {
        accessorKey: 'totalDeliveries',
        header: 'عدد التوصيلات',
        cell: (info) => (
          <Typography sx={{ color: '#1A2E1A', fontSize: 14, fontWeight: 500 }}>
            {Number(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'التقييم',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {Number(info.getValue()) || '-'} ⭐
          </Typography>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'تاريخ الانضمام',
        cell: (info) => (
          <Typography sx={{ color: '#5A6A5A', fontSize: 13 }}>
            {format(new Date(String(info.getValue())), 'dd MMM yyyy', { locale: ar })}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => {
          const rider = row.original;
          return (
            <Box onClick={(e) => e.stopPropagation()}>
              <Button
                size="small"
                variant="outlined"
                startIcon={rider.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                onClick={() => updateStatusMutation.mutate({ id: rider.id, isActive: !rider.isActive })}
                disabled={updateStatusMutation.isPending}
                sx={{
                  borderColor: rider.isActive ? '#EF4444' : '#86B573',
                  color: rider.isActive ? '#EF4444' : '#86B573',
                  '&:hover': {
                    borderColor: rider.isActive ? '#DC2626' : '#6B9B5E',
                    bgcolor: rider.isActive ? 'rgba(239, 68, 68, 0.08)' : 'rgba(134, 181, 115, 0.08)',
                  },
                }}
              >
                {rider.isActive ? 'تعطيل' : 'تفعيل'}
              </Button>
            </Box>
          );
        },
      },
    ],
    [updateStatusMutation, statusColors]
  );

  if (isLoading) {
    return <SkeletonLoader variant="cards" count={3} />;
  }

  const riders = data?.riders ?? [];

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
            السائقون
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A5A', fontSize: { xs: 12, sm: 14 } }}>
            إدارة السائقين والـ Riders
          </Typography>
        </Box>

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
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="الحالة"
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B1C0B1' },
              }}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="available">متاح</MenuItem>
              <MenuItem value="heading_to_restaurant">في الطريق للمطعم</MenuItem>
              <MenuItem value="at_restaurant">في المطعم</MenuItem>
              <MenuItem value="delivering">يوصّل</MenuItem>
              <MenuItem value="offline">غير متصل</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {riders.length === 0 ? (
        <EmptyState
          title="لا يوجد سائقون"
          description="لم يتم العثور على سائقين مطابقين للبحث أو الفلاتر."
        />
      ) : (
        <DataTable
          data={riders}
          columns={columns}
          searchable={false}
          isLoading={isLoading}
          onRowClick={(r) => navigate(`/riders/${r.id}`)}
        />
      )}
    </Box>
  );
};

export default RidersListPage;
