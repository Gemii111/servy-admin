import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SkeletonLoader from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  getRestaurantMenu,
  setMenuItemAvailability,
  MenuItemOversight,
  MenuCategoryGroup,
} from '../../services/api/menu';

interface RestaurantMenuPanelProps {
  restaurantId: string;
  compact?: boolean;
}

const RestaurantMenuPanel: React.FC<RestaurantMenuPanelProps> = ({
  restaurantId,
  compact = false,
}) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { data, isLoading } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => getRestaurantMenu(restaurantId),
    enabled: !!restaurantId,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ itemId, available }: { itemId: string; available: boolean }) =>
      setMenuItemAvailability(itemId, available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] });
      showSnackbar('تم تحديث توفر الصنف', 'success');
    },
    onError: (e: Error) => showSnackbar(e.message, 'error'),
  });

  const renderItemRow = (item: MenuItemOversight) => (
    <Box
      key={item.id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1,
        px: compact ? 0 : 1,
        opacity: item.is_available ? 1 : 0.55,
      }}
    >
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {item.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {Number(item.price)} ج.م
        </Typography>
      </Box>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={item.is_available}
            disabled={toggleMutation.isPending}
            onChange={(e) =>
              toggleMutation.mutate({ itemId: item.id, available: e.target.checked })
            }
          />
        }
        label={item.is_available ? 'متاح' : 'غير متاح'}
        labelPlacement="start"
      />
    </Box>
  );

  if (isLoading) {
    return <SkeletonLoader variant="table" />;
  }

  const categories = data?.categories ?? [];
  const flatItems = data?.items ?? [];

  if (!categories.length && !flatItems.length) {
    return (
      <EmptyState
        title="لا توجد أصناف"
        description="لم يُعثر على قائمة لهذا المتجر."
      />
    );
  }

  if (categories.length > 0) {
    return (
      <Box>
        {categories.map((cat: MenuCategoryGroup) => (
          <Accordion
            key={cat.id}
            defaultExpanded={!compact}
            disableGutters
            sx={{
              bgcolor: '#FFFFFF',
              border: '1px solid #B1C0B1',
              mb: 1,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{cat.name}</Typography>
              <Typography variant="caption" sx={{ ml: 2, color: '#5A6A5A' }}>
                {cat.items.length} صنف
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              {cat.items.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {renderItemRow(item)}
                  {idx < cat.items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {flatItems.map((item, idx) => (
        <React.Fragment key={item.id}>
          {renderItemRow(item)}
          {idx < flatItems.length - 1 && <Divider sx={{ my: 0.5 }} />}
        </React.Fragment>
      ))}
    </Paper>
  );
};

export default RestaurantMenuPanel;
