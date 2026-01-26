import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  mockGetRestaurants,
  mockApproveRestaurant,
  mockRejectRestaurant,
  Restaurant,
} from '../../services/api/restaurants';

const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', 'pending'],
    queryFn: () => mockGetRestaurants({ status: 'pending', limit: 100 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => mockApproveRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      showSnackbar('تم الموافقة على المطعم بنجاح', 'success');
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء الموافقة على المطعم', 'error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      mockRejectRestaurant(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      showSnackbar('تم رفض المطعم', 'success');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedRestaurant(null);
    },
    onError: () => {
      showSnackbar('حدث خطأ أثناء رفض المطعم', 'error');
    },
  });

  const handleApprove = (restaurant: Restaurant) => {
    if (window.confirm(`هل أنت متأكد من الموافقة على المطعم "${restaurant.name}"؟`)) {
      approveMutation.mutate(restaurant.id);
    }
  };

  const handleReject = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedRestaurant && rejectReason.trim()) {
      rejectMutation.mutate({ id: selectedRestaurant.id, reason: rejectReason });
    } else {
      showSnackbar('يرجى إدخال سبب الرفض', 'warning');
    }
  };

  const restaurants = data?.restaurants || [];

  return (
    <Box sx={{ color: '#E5E7EB' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            المطاعم المعلقة
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            مراجعة والموافقة على المطاعم الجديدة
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/restaurants')}>
          العودة إلى القائمة
        </Button>
      </Box>

      {/* Pending Restaurants */}
      {isLoading ? (
        <SkeletonLoader variant="cards" count={3} />
      ) : restaurants.length === 0 ? (
        <EmptyState
          title="لا توجد مطاعم معلقة"
          description="جميع المطاعم تمت مراجعتها."
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {restaurants.map((restaurant) => (
            <Paper
              key={restaurant.id}
              sx={{
                bgcolor: '#111827',
                borderRadius: 2,
                border: '1px solid #1F2937',
                p: 3,
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#E5E7EB', mb: 1, fontWeight: 600 }}>
                  {restaurant.name}
                </Typography>
                <Chip
                  label="قيد المراجعة"
                  size="small"
                  sx={{
                    bgcolor: '#F59E0B20',
                    color: '#F59E0B',
                    fontWeight: 500,
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                  صاحب المطعم
                </Typography>
                <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
                  {restaurant.ownerName}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                  البريد الإلكتروني
                </Typography>
                <Typography variant="body2" sx={{ color: '#E5E7EB' }}>
                  {restaurant.ownerEmail}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                  نوع المطبخ
                </Typography>
                <Chip
                  label={restaurant.cuisineType}
                  size="small"
                  sx={{
                    bgcolor: '#2563EB20',
                    color: '#2563EB',
                    fontSize: 12,
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleApprove(restaurant)}
                  fullWidth
                  sx={{ flex: 1 }}
                >
                  موافقة
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleReject(restaurant)}
                  fullWidth
                  sx={{ flex: 1 }}
                >
                  رفض
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectReason('');
          setSelectedRestaurant(null);
        }}
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #1F2937',
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ color: '#E5E7EB' }}>رفض المطعم</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
            يرجى إدخال سبب رفض المطعم "{selectedRestaurant?.name}"
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="سبب الرفض..."
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#020617',
                '& fieldset': { borderColor: '#1F2937' },
                '&:hover fieldset': { borderColor: '#374151' },
              },
              input: { color: '#E5E7EB' },
              textarea: { color: '#E5E7EB' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #1F2937' }}>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectReason('');
              setSelectedRestaurant(null);
            }}
            sx={{ color: '#9CA3AF' }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectConfirm}
            disabled={!rejectReason.trim()}
          >
            رفض
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingApprovalPage;

