import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../components/tables/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import { getRestaurants } from '../../services/api/restaurants';
import {
  getRestaurantMenu,
  setMenuItemAvailability,
  MenuItemOversight,
} from '../../services/api/menu';

const MenuOversightPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [restaurantId, setRestaurantId] = useState('');

  const { data: restaurantsData, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['restaurants', 'menu-select'],
    queryFn: () => getRestaurants({ page: 1, limit: 100 }),
  });

  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => getRestaurantMenu(restaurantId),
    enabled: !!restaurantId,
  });

  const menuItems = menuData?.items ?? [];

  const toggleMutation = useMutation({
    mutationFn: ({ itemId, available }: { itemId: string; available: boolean }) =>
      setMenuItemAvailability(itemId, available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] });
      showSnackbar('تم تحديث توفر الصنف', 'success');
    },
    onError: (e: Error) => showSnackbar(e.message, 'error'),
  });

  const columns: ColumnDef<MenuItemOversight>[] = [
    { accessorKey: 'name', header: 'الصنف' },
    { accessorKey: 'category', header: 'التصنيف' },
    {
      accessorKey: 'price',
      header: 'السعر',
      cell: (info) => `${Number(info.getValue())} ج.م`,
    },
    {
      id: 'available',
      header: 'متاح',
      cell: ({ row }) => (
        <FormControlLabel
          control={
            <Switch
              checked={row.original.is_available}
              onChange={(e) =>
                toggleMutation.mutate({
                  itemId: row.original.id,
                  available: e.target.checked,
                })
              }
              color="primary"
            />
          }
          label={row.original.is_available ? 'نعم' : 'لا'}
        />
      ),
    },
  ];

  return (
    <Box sx={{ color: '#1A2E1A' }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        إشراف المنيو
      </Typography>
      <Typography variant="body2" sx={{ color: '#5A6A5A', mb: 3 }}>
        عرض أصناف أي متجر وتعطيل/تفعيل التوفر
      </Typography>

      <Paper sx={{ p: 2, mb: 3, border: '1px solid #B1C0B1' }}>
        <FormControl size="small" fullWidth sx={{ maxWidth: 400 }}>
          <InputLabel>اختر المتجر</InputLabel>
          <Select
            value={restaurantId}
            label="اختر المتجر"
            onChange={(e) => setRestaurantId(e.target.value)}
            disabled={restaurantsLoading}
          >
            {(restaurantsData?.restaurants ?? []).map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {!restaurantId ? (
        <EmptyState title="اختر متجراً" description="اختر مطعماً لعرض قائمة الأصناف" />
      ) : menuLoading ? (
        <SkeletonLoader variant="table" />
      ) : (
        <DataTable data={menuItems} columns={columns} />
      )}
    </Box>
  );
};

export default MenuOversightPage;
